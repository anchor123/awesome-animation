import Timeline from "./Timeline";
import { parseTime } from "./utils/index";
import easingTable from "./easing.js";

/**
 * 动画基本类
 */
export default class Animator {
	beginValue: Function | number;
	finishValue: Function | number;
	setter: Timeline.Setter;

	constructor(
		beginValue: Function | number,
		finishValue: Function | number,
		setter: Timeline.Setter
	) {
		this.beginValue = beginValue;
		this.finishValue = finishValue;
		this.setter = setter;
	}

	static DEFAULT_DURATION = 300;
	static DEFAULT_EASING = "ease";

	/**
	 * 使用当前的动画器启动在指定目标上启动动画
	 * @param target
	 * @param options
	 * @returns Timeline
	 */
	start(
		target: any,
		options: {
			duration: number;
			easing: string | Animation.Easing;
			delay: number;
			callback: Function;
		}
	) {
		const timeline = this.create(target, options.duration, options.easing);
		const delay = parseTime(options.delay);
		if (delay > 0) {
			setTimeout(() => {
				timeline.play();
			}, delay);
		} else {
			timeline.play();
		}
		return timeline;
	}

	/**
	 * 使用当前的动画器为指定目标创建时间线
	 * @param target
	 * @param duration
	 * @param easing
	 * @returns Timeline
	 */
	create(target: any, duration: number, easing: string | Animation.Easing) {
		duration = parseTime(duration) || Animator.DEFAULT_DURATION;
		easing = easing || Animator.DEFAULT_EASING;
		if (typeof easing === "string") {
			easing = easingTable[easing] as Animation.Easing;
		}

		const timeline = new Timeline(this, target, duration, easing);
		return timeline;
	}

	/**
	 * 创建一个与当前动画器相反的动画器
	 * @returns Animator
	 */
	reverse() {
		return new Animator(this.finishValue, this.beginValue, this.setter);
	}
}
