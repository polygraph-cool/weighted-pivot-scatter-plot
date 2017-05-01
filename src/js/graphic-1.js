import * as d3 from 'd3'

const graphic = d3.select('.graphic--1')

const COLORS = ['#ff3814', '#fe5c34', '#fc764f', '#f88d69', '#f2a385', '#e8b8a0', '#dbcdbd']
const FONT_SIZE = 11
const MAX = 10
const dummyData = d3.range(0, 50).map(d => ({
	index: d,
	x: 0.5 + Math.random() * (MAX - 1),
	y: 0.5 + Math.random() * (MAX - 1),
}))

const chart = scatterplot()
const el = graphic.select('.chart')

function weightData({ x, y }) {
	return dummyData.map(d => ({
		...d,
		score: d.x * x + d.y * y,
	}))
	.sort((a, b) => d3.descending(a.score, b.score))
	.map((d, i) => ({
		...d,
		rank: i,
	}))
	.reverse()
}

function resize() {
	const sz = Math.min(el.node().offsetWidth, window.innerHeight) * 0.8
	chart.width(sz).height(sz)
	el.call(chart)
}

function scatterplot() {
	const margin = FONT_SIZE * 3
	const scaleX = d3.scaleLinear()
	const scaleY = d3.scaleLinear()
	const scaleR = d3.scaleSqrt()
	const scaleC = d3.scaleQuantile()

	let width = 500
	let height = 500
	let chartWidth = width - margin * 2
	let chartHeight = height - margin * 2

	function translate(x, y) {
		return `translate(${x}, ${y})`
	}

	function enter({ container, data }) {
		const svg = container.selectAll('svg').data([data])
		const svgEnter = svg.enter().append('svg')
      	const gEnter = svgEnter.append('g')
		
		const axis = gEnter.append('g').attr('class', 'g-axis')

		const x = axis.append('g').attr('class', 'axis axis--x')

		const y = axis.append('g').attr('class', 'axis axis--y')

		x.append('text').attr('class', 'axis__label')
			.attr('text-anchor', 'middle')
			.text('Quantity')

		y.append('text').attr('class', 'axis__label')
			.attr('text-anchor', 'middle')
			.text('Quality')

		gEnter.append('g').attr('class', 'g-plot')
	}

	function exit({ container, data }) {
	}

	function updateScales({ data }) {
		scaleX
			.domain([0, MAX])
			.range([0, chartWidth])

		scaleY
			.domain([0, MAX])
			.range([chartHeight, 0])

		scaleR
			.domain([0, data.length])
			.range([20, 2])

		scaleC
			.domain(data.map(d => d.rank))
			.range(COLORS)
	}

	function updateDom({ container, data }) {
		const svg = container.select('svg')
		
		svg
			.attr('width', width)
			.attr('height', height)

		const g = svg.select('g')
		
		g.attr('transform', translate(margin, margin))

		const plot = g.select('.g-plot')

		const item = plot.selectAll('.item').data(d => d, d => d.index)
		
		item.enter().append('circle')
			.attr('class', 'item')
		.merge(item)
			.transition()
			.duration(100)
			.ease(d3.easeLinear)
			.attr('x', 0)
			.attr('y', 0)
			.attr('r', d => scaleR(d.rank))
			.style('fill', d => scaleC(d.rank))
			.style('stroke', d => d3.color(scaleC(d.rank)).darker(0.7))
			.attr('transform',  d => translate(scaleX(d.x), scaleY(d.y)))
	}

	function updateAxis({ container, data }) {
		const axis = container.select('.g-axis')

		const axisLeft = d3.axisLeft(scaleY)
		const axisBottom = d3.axisBottom(scaleX)

		const x = axis.select('.axis--x')
		
		x.attr('transform', translate(0, chartHeight))
			.call(axisBottom)

		const y = axis.select('.axis--y')

		y.call(axisLeft)

		x.select('.axis__label')
			.attr('x', chartWidth / 2)
			.attr('y', margin - 1)

		y.select('.axis__label')
			.attr('x', -chartHeight / 2)
			.attr('y', -margin + FONT_SIZE)
			.attr('transform', `rotate(-90)`)


	}

	function chart(container) {
		const data = container.datum()
		
		enter({ container, data })
		exit({ container, data })
		updateScales({ container, data })
		updateDom({ container, data })
		updateAxis({ container, data })
	}

	chart.width = function(...args) {
		if (!args.length) return width
		width = args[0]
		chartWidth = width - margin * 2
		return chart
	}

	chart.height = function(...args) {
		if (!args.length) return height
		height = args[0]
		chartHeight = height - margin * 2
		return chart
	}

	return chart
}

function handleInput() {
	const val = +this.value
	const x = val
	const y = 100 - val
	const weighted = weightData({ x, y })
	el.datum(weighted)
	el.call(chart)
}

function init() {
	el.datum(weightData({ x: 50, y: 50 }))
	el.call(chart)
	resize()
	graphic.select('.slider input').on('input', handleInput)
}


export default { init, resize }

