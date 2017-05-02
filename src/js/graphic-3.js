import * as d3 from 'd3'

const graphic = d3.select('.graphic--3')

const COLORS = ['#ff3814', '#fe5c34', '#fc764f', '#f88d69', '#f2a385', '#e8b8a0', '#dbcdbd']
const FONT_SIZE = 11
const MAX_VAL = 10
const dummyData = d3.range(0, 50).map(d => ({
	index: d,
	x: 0.5 + Math.random() * (MAX_VAL - 1),
	y: 0.5 + Math.random() * (MAX_VAL - 1),
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

function getHypotenuse({ x, y }) {
	const x2 = x * x
	const y2 = y * y
	return Math.sqrt(x2 + y2)
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

	let width = 0
	let height = 0
	let chartWidth = 0
	let chartHeight = 0
	let weightX = 50
	let weightY = 50
	let hypotenuse = 0

	function translate(x, y) {
		return `translate(${x}, ${y})`
	}

	function enter({ container, data }) {
		const svg = container.selectAll('svg').data([data])
		const svgEnter = svg.enter().append('svg')
      	const gEnter = svgEnter.append('g')
		
		gEnter.append('g').attr('class', 'g-plot')

		const axis = gEnter.append('g').attr('class', 'g-axis')

		const x = axis.append('g').attr('class', 'axis axis--x')

		const y = axis.append('g').attr('class', 'axis axis--y')

		x.append('text').attr('class', 'axis__label')
			.attr('text-anchor', 'start')
			.text('Quantity')

		y.append('text').attr('class', 'axis__label')
			.attr('text-anchor', 'end')
			.text('Quality')	
	}

	function exit({ container, data }) {
	}

	function updateScales({ data }) {
		hypotenuse = getHypotenuse({ x: weightX, y: weightY })
		const rangeX = weightX / hypotenuse * chartWidth
		const rangeY = weightY / hypotenuse * chartHeight
		const maxR = Math.floor(FONT_SIZE * 1.5)

		scaleX
			.domain([0, MAX_VAL])
			.range([0, rangeX])

		scaleY
			.domain([0, MAX_VAL])
			.range([rangeY, 0])

		scaleR
			.domain([0, data.length])
			.range([maxR, 2])

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
		
		const maxY = scaleY.range()[0]
		const offsetX = chartWidth / 2
		const offsetY = chartHeight - maxY
		const rad = Math.acos(weightX / hypotenuse)
		const angle = 90 - (rad * 180 / Math.PI)
		const rotation = `rotate(${-angle} 0 ${scaleY.range()[0]})`
		const translation = translate(margin * 1.5 + offsetX, margin + offsetY)
		const transform = `${translation} ${rotation}`
		g.attr('transform', transform)

		const plot = g.select('.g-plot')

		const item = plot.selectAll('.item').data(d => d, d => d.index)
		
		item.enter().append('circle')
			.attr('class', 'item')
		.merge(item)
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

		axisLeft.ticks(Math.max(0, Math.floor(weightY / 10)))
		axisBottom.ticks(Math.max(0, Math.floor(weightX / 10)))
		const x = axis.select('.axis--x')
		
		const maxY = scaleY.range()[0]
		const offset = maxY

		const buffer = Math.ceil(margin / 2)
		x.attr('transform', translate(0, buffer + offset))
			.call(axisBottom)

		const y = axis.select('.axis--y')

		y.attr('transform', translate(-buffer, 0))
			.call(axisLeft)

		x.select('.axis__label')
			.attr('y', margin - 1)

		y.select('.axis__label')
			.attr('x', offset)
			.attr('y', margin - 1)
			.attr('transform', `rotate(90)`)
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
		chartWidth = width - margin * 2.5
		return chart
	}

	chart.height = function(...args) {
		if (!args.length) return height
		height = args[0]
		chartHeight = height - margin * 2.5
		return chart
	}

	chart.weight = function({ x, y }) {
		weightX = x
		weightY = y
		return chart
	}



	return chart
}

function handleInput() {
	const val = +this.value
	const x = val
	const y = 100 - val
	const weighted = weightData({ x, y })

	chart.weight({ x, y })
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
