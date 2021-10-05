import { baseMixin } from '../base/base-mixin';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

const WordcloudChart = function (parent, chartGroup) {
    const _chart = baseMixin({});

    let _cloud = null,
        _g = null,
        _padding = 5,
        _font = 'Impact',
        // _relativeSize = 10,
        _relativeSize = 5,
        _minX = 0,
        _minY = 0;
    const _fill = d3.scaleOrdinal(d3.schemeCategory10); //d3.scale.category20();

    _chart._doRender = function () {
        _chart.on('postRender', () => {
            _chart.apply();
        });
        drawWordCloud();

        return _chart._doRedraw();
    };

    function initializeSvg () {
        _chart.select('svg').remove();

        _g = d3
      .select(_chart.anchor())
      .append('svg')
      .attr('height', _chart.height())
      // .attr("height", 200)
      .attr('width', _chart.width())
      .attr('cursor', 'pointer');
    }

    // const titleFunction = function (d) {
    //     return _chart.title()(d);
    // };

    function drawWordCloud () {
        initializeSvg();

        const groups = _chart._computeOrderedGroups(_chart.data()).filter(d => _chart.valueAccessor()(d) !== 0);

        const data = groups.map((d, i) => {
            const value = _chart.valueAccessor()(d);
            const key = _chart.keyAccessor()(d);
            const title = _chart.title()(d);
            const result = {
                text: d.key,
                size: checkSize(d),
                value: value,
                key: key,
                title: title,
                fill: _fill(i),
                x: d.x,
                y: d.y,
            };

            return result;
        });

        // const displaySelection = _g.append("text")
        // .attr("font-family", "Lucida Console, Courier, monospace")
        // .attr("text-anchor", "start")
        // .attr("alignment-baseline", "hanging")
        // .attr("x", 10)
        // .attr("y", 10);
        _chart.width(parent.parentElement.offsetWidth - 24);
        _chart.height(parent.parentElement.offsetHeight - 24);

        _cloud = cloud().size([_chart.width(), _chart.height()]);

        _cloud
      .words(data)
      .padding(_chart.padding())
      .rotate(() => ~~(Math.random() * 2) * 90)
      .font(_chart.font())
      .fontSize(d => d.size)
      .on('word', ({ size, x, y, rotate, text, fill }) => {
          _g.append('text')
          .attr('font-size', size)
          // .attr("font-size", "12px")
          .attr('text-anchor', 'middle')
          .attr('transform', `translate(${x},${y}) rotate(${rotate})`)
          .text(text)
          // .classed("click-only-text", true)
          // .classed("word-default", true)
          .style('fill', fill)          
          .on('mouseover', handleMouseOver)
          .on('mouseout', handleMouseOut)
          .on('click', handleClick);

          function handleMouseOver (d, i) {
              d3.select(this)
            .classed('word-hovered', true)
            .transition(`mouseover-${text}`)
            .duration(300)
            .ease(d3.easeLinear)
            .attr('font-size', size + 2)
            .attr('font-weight', 'bold');
          }

          function handleMouseOut (d, i) {
              d3.select(this)
            .classed('word-hovered', false)
            .interrupt(`mouseover-${text}`)
            .attr('font-size', size);
          }

          function handleClick (d, i) {
              const e = d3.select(this);
              const filterfun = e.text()
                  ? function (val) {
                      // return new RegExp(e.text(), "i").test(val);
                      return val;
                  }
                  : null;
              console.log(`Select: ${e.text()}`);
              _chart._dimension.filter(e.text());
              // displaySelection.text(`selection="${e.text()}"`);
              e.classed('word-selected', !e.classed('word-selected'));
          }
      });
        //   .on('end', draw);

        _cloud.start();
    }

    _chart._doRedraw = function () {
        _chart.on('postRedraw', () => {
            _chart.apply();
        });

        drawWordCloud();
    };

    _chart.apply = function () {
        d3.select(_chart.anchor())
      .select('svg')
      .attr(
          'viewBox',
          `${_chart.minX() 
          } ${ 
              _chart.minY() 
          } ${ 
              _chart.width() 
          } ${ 
              _chart.height()}`
      );
    };

    function checkSize (d) {
        let x = 0;
        if (d.value <= 0) {
            x = 0;
        } else {
            x = Math.log(d.value) * _chart.relativeSize();
        }

        return x;
    }

    _chart.minX = function (_) {
        if (!arguments.length) {
            return _minX;
        }

        _minX = _;
        return _chart;
    };

    _chart.minY = function (_) {
        if (!arguments.length) {
            return _minY;
        }

        _minY = _;
        return _chart;
    };

    _chart.padding = function (_) {
        if (!arguments.length) {
            return _padding;
        }

        _padding = _;
        return _chart;
    };

    _chart.font = function (_) {
        if (!arguments.length) {
            return _font;
        }

        _font = _;
        return _chart;
    };

    // _chart.coordinateAccessor = function (_) {
    //     if (!arguments.length) {
    //         return _coordinate;
    //     }

    //     _coordinate = _;
    //     return _chart;
    // };

    // _chart.radiusAccessor = function (_) {
    //     if (!arguments.length) {
    //         return _radiusAccessor;
    //     }

    //     _radiusAccessor = _;
    //     return _chart;
    // };

    _chart.relativeSize = function (_) {
        if (!arguments.length) {
            return _relativeSize;
        }

        _relativeSize = _;
        return _chart;
    };

    return _chart.anchor(parent, chartGroup);
};

export const wordcloudChart = (parent, chartGroup) => new WordcloudChart(parent, chartGroup);