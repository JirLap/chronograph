const Homey = require('homey');
const Stopwatch = require('../stopwatch.js');

class StopwatchRunning extends Homey.FlowCardCondition {
	constructor(conditionId) {
		super(conditionId);

		this.register();
		this.registerRunListener((args) => {
			let stopwatch = Stopwatch.get(args.name);
			return Promise.resolve(!!stopwatch && stopwatch.isRunning());
		});
	}
}

module.exports = StopwatchRunning;