import { BaseMixin } from '../base/base-mixin';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

export class WordcloudChart extends BaseMixin {

    constructor (parent, chartGroup) {
        super();

        this._cloud = null;
        this._g = null;
        this._padding = 5;
        this._font = 'Impact';
        this._relativeSize = 10;
        this._minX = 0;
        this._minY = 0;
        this._fill = d3.scaleOrdinal(d3.schemeCategory10); //d3.scale.category20();

        // const titleFunction = function (d) {
        //     return this.title()(d);
        // };

        this.anchor(parent, chartGroup);
    }

    _doRender () {
        this.on('postRender', function () {
            this.apply();
        });
        this.drawWordCloud();

        return this._doRedraw();
    }

    initializeSvg () {
        this.select('svg').remove();

        this._g = d3
      .select(this.anchor())
      .append('svg')
      .attr('height', this.height())
      .attr('width', this.width())
      .append('g')
      //.on('click', this.onClick)
      .attr('cursor', 'pointer');
    }

    drawWordCloud () {
        this.initializeSvg();

        // const groups = this._computeOrderedGroups(this.data()).filter(function (d) {
        //     return this.valueAccessor()(d) !== 0;
        // });
        const groups = this._computeOrderedGroups(this.data()).filter(d => this.valueAccessor()(d) !== 0);        

        const data = groups.map(d => {
            const value = this.valueAccessor()(d);
            const key = this.keyAccessor()(d);
            const title = this.title()(d);
            const result = {
                text: d.key,
                size: this.checkSize(d),
                value: value,
                key: key,
                title: title,
            };

            return result;
        });

        this._cloud = cloud().size([this.width(), this.height()]);

        this._cloud
      .words(data)
      .padding(this.padding())
      .rotate(() => ~~(Math.random() * 2) * 90)
      .font(this.font())
      .fontSize(d => d.size)
      .on('word', ({ size, x, y, rotate, text, fill }) => {
          this._g.append('text')
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
              //   const filterfun = e.text()
              //       ? function (val) {
              //           // return new RegExp(e.text(), "i").test(val);
              //           return val;
              //       }
              //       : null;
              console.log(`Select: ${e.text()}`);
              this._dimension.filter(e.text());
              // displaySelection.text(`selection="${e.text()}"`);
              e.classed('word-selected', !e.classed('word-selected'));
          }
      });      
        //   .on('end', this.draw);

        this._cloud.start();
    }

    _doRedraw () {
        this.on('postRedraw', function () {
            this.apply();
        });

        this.drawWordCloud();
    }

    apply () {
        d3.select(this.anchor())
      .select('svg')
      .attr(
          'viewBox',
          `${this.minX() 
          } ${ 
              this.minY() 
          } ${ 
              this.width() 
          } ${ 
              this.height()}`
      );
    }

    checkSize (d) {
        let x = 0;
        if (d.value <= 0) {
            x = 0;
        } else {
            x = Math.log(d.value) * this.relativeSize();
        }

        return x;
    }
    
    draw (words) {
        d3
      .select('.dc-chart')
      .append('svg')
      .attr('height', this.size()[1])
      .attr('width', this.size()[0])
      .append('g')
      //.on('click', this.onClick)
      .attr('cursor', 'pointer')
      .attr('width', this.size()[0])
      .attr('height', this.size()[1])
      .attr('transform', 'translate(150,150)')
      .selectAll('text')
      .data(words)
      .enter()
      .append('text')
      .style('font-size', d => `${d.size}px`)
      .style('font-family', 'Impact')
      .style('fill', (d, i) => d3.scaleOrdinal(d3.schemeCategory10)(i))
      .attr('text-anchor', 'middle')
      .attr('transform', d => `translate(${[d.x, d.y]})`)
      .text(d => d.text)
      .append('title')
      .text(d => d.title);
    }

    minX (_) {
        if (!arguments.length) {
            return this._minX;
        }

        this._minX = _;
        return this;
    }

    minY (_) {
        if (!arguments.length) {
            return this._minY;
        }

        this._minY = _;
        return this;
    }

    padding (_) {
        if (!arguments.length) {
            return this._padding;
        }

        this._padding = _;
        return this;
    }

    font (_) {
        if (!arguments.length) {
            return this._font;
        }

        this._font = _;
        return this;
    }

    coordinateAccessor (_) {
        if (!arguments.length) {
            return this._coordinate;
        }

        this._coordinate = _;
        return this;
    }

    radiusAccessor (_) {
        if (!arguments.length) {
            return this._radiusAccessor;
        }

        this._radiusAccessor = _;
        return this;
    }

    relativeSize (_) {
        if (!arguments.length) {
            return this._relativeSize;
        }

        this._relativeSize = _;
        return this;
    }
}

export const wordcloudChart = (parent, chartGroup) => new WordcloudChart(parent, chartGroup);
