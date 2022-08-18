import {array, ease, Root, Tooltip} from "@amcharts/amcharts5";
import {useEffect, useState} from "react";
import {AnimatedTheme} from "@amcharts/amcharts5/.internal/themes/AnimatedTheme";
import {AxisRendererX, AxisRendererY, CategoryAxis, ColumnSeries, ValueAxis, XYChart, XYCursor } from "@amcharts/amcharts5/xy";

export default function RankingListChart(props: {scoreData: {name: string, score: number}[], height: number}) {

    const [root, setRoot] = useState<Root>()
    const [chart, setChart] = useState<XYChart>()
    const [series, setSeries] = useState<ColumnSeries>()

    useEffect(() => {
        let root = Root.new("chartdiv");


// Set themes
// https://www.amcharts.com/docs/v5/concepts/themes/
        root.setThemes([
            AnimatedTheme.new(root)
        ]);


// Create chart
// https://www.amcharts.com/docs/v5/charts/xy-chart/
        let chart = root.container.children.push(XYChart.new(root, {
            panX: false,
            panY: false,
            wheelX: "none",
            wheelY: "none"
        }));

// We don't want zoom-out button to appear while animating, so we hide it
        chart.zoomOutButton.set("forceHidden", true);


// Create axes
// https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
        let yRenderer = AxisRendererY.new(root, {
            minGridDistance: 30
        });

        let yAxis = chart.yAxes.push(CategoryAxis.new(root, {
            maxDeviation: 0,
            categoryField: "name",
            renderer: yRenderer,
            tooltip: Tooltip.new(root, { themeTags: ["axis"] })
        }));

        let xAxis = chart.xAxes.push(ValueAxis.new(root, {
            maxDeviation: 0,
            min: 0,
            extraMax: 0.1,
            renderer: AxisRendererX.new(root, {})
        }));


// Add series
// https://www.amcharts.com/docs/v5/charts/xy-chart/series/
        let series = chart.series.push(ColumnSeries.new(root, {
            name: "Series 1",
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: "score",
            categoryYField: "name",
            tooltip: Tooltip.new(root, {
                pointerOrientation: "left",
                labelText: "{valueX}"
            })
        }));


// Rounded corners for columns
        series.columns.template.setAll({
            cornerRadiusTR: 5,
            cornerRadiusBR: 5
        });

// Make each column to be of a different color
        series.columns.template.adapters.add("fill", function(fill, target) {
            return chart.get("colors")!.getIndex(series.columns.indexOf(target));
        });

        series.columns.template.adapters.add("stroke", function(stroke, target) {
            return chart.get("colors")!.getIndex(series.columns.indexOf(target));
        });

        yAxis.data.setAll(props.scoreData);
        series.data.setAll(props.scoreData);
        sortCategoryAxis();

// Get series item by category
        function getSeriesItem(category: string) {
            for (var i = 0; i < series.dataItems.length; i++) {
                let dataItem = series.dataItems[i];
                if (dataItem.get("categoryY") == category) {
                    return dataItem;
                }
            }
        }

        chart.set("cursor", XYCursor.new(root, {
            behavior: "none",
            xAxis: xAxis,
            yAxis: yAxis
        }));


// Axis sorting
        function sortCategoryAxis() {

            // Sort by score
            series.dataItems.sort(function(x, y) {
                return x.get("valueX")! - y.get("valueX")!; // descending
                //return y.get("valueY") - x.get("valueX"); // ascending
            })

            // Go through each axis item
            array.each(yAxis.dataItems, function(dataItem) {
                // get corresponding series item
                let seriesDataItem = getSeriesItem(dataItem.get("category")!);

                if (seriesDataItem) {
                    // get index of series data item
                    let index = series.dataItems.indexOf(seriesDataItem);
                    // calculate delta position
                    let deltaPosition = (index - dataItem.get("index", 0)) / series.dataItems.length;
                    // set index to be the same as series data item index
                    dataItem.set("index", index);
                    // set deltaPosition instanlty
                    dataItem.set("deltaPosition", -deltaPosition);
                    // animate delta position to 0
                    dataItem.animate({
                        key: "deltaPosition",
                        to: 0,
                        duration: 1000,
                        easing: ease.out(ease.cubic)
                    })
                }
            });

            // Sort axis items by index.
            // This changes the order instantly, but as deltaPosition is set,
            // they keep in the same places and then animate to true positions.
            yAxis.dataItems.sort(function(x, y) {
                return x.get("index")! - y.get("index")!;
            });
        }


// update data with random values each 1.5 sec
        setInterval(function () {
            sortCategoryAxis()
        }, 1500)


// Make stuff animate on load
// https://www.amcharts.com/docs/v5/concepts/animations/
        setRoot(root)
        setChart(chart)
        setSeries(series)
        series.appear(0);
        chart.appear(1000, 100);
        return () => {
            root.dispose()
        }
    }, [props.height])

    useEffect(() => {

        if (!(root && chart && series)) return
        array.each(series.dataItems, function (dataItem) {
            let score = props.scoreData.find(team => team.name === dataItem.get("categoryY")!)?.score;
            // both valueY and workingValueY should be changed, we only animate workingValueY
            dataItem.set("valueX", score ?? 0);
            dataItem.animate({
                key: "valueXWorking",
                to: score,
                duration: 600,
                easing: ease.out(ease.cubic)
            });
        })
    })

    return (
        <div id={"chartdiv"} style={{width: "100%", height: `${props.height}px`}}/>
    )
}