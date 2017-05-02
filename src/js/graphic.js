import graphic1 from './graphic-1'
import graphic2 from './graphic-2'
import graphic3 from './graphic-3'

function resize() {
	graphic1.resize()
	graphic2.resize()
	graphic3.resize()
}

function init() {
	graphic1.init()
	graphic2.init()
	graphic3.init()
}

export default { init, resize }
