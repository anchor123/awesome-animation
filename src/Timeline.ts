import Animator from "./Animator";
import { Frame, releaseFrame, requestFrame } from "./frame";
import { getPercentValue } from "./utils/index";

/**
 * 动画时间线类
 */
export default class Timeline {
	time: number; // 当前时间
	frame?: Frame; // 当前帧
	lastValue?: number; // 上一个值
	currentValue: any; // 当前值
	setter: Timeline.Setter; // 值设置函数
	animator: Animator; // 动画执行器
	target: any; // 目标对象
	duration: number; // 持续时间
	easing: Animation.Easing; // 缓动函数
	beginValue: number | Function; // 起始值
	finishValue: number | Function; // 结束值
	rollbacking: boolean = false; // 是否正在逆放
	repeatOption: number | boolean = false; // 重复选项
	rollback: boolean = false; // 是否来回播放
	status: "ready" | "playing" | "stoped" | "paused" | "finished"; // 当前状态

	constructor(
		animator: Animator,
		target: any,
		duration: number,
		easing: Animation.Easing
	) {
		this.animator = animator;
		this.target = target;
		this.duration = duration;
		this.easing = easing;
		this.time = 0;
		this.beginValue = animator.beginValue;
		this.finishValue = animator.finishValue;
		this.setter = animator.setter;
		this.status = "ready";
	}

	/**
	 * 让时间线进入下一帧
	 * @param frame
	 */
	private nextFrame(frame: Frame) {
		if (this.status === "playing") return;

		this.time += frame.dur;

		this.setValue(this.getValue());

		if (this.time >= this.duration) {
			this.timeUp();
		}

		frame.next();
	}

	/**
	 * 把值通过动画器的 setter 设置到目标上
	 * @param value
	 */
	private setValue(value: any) {
		this.lastValue = this.currentValue;
		this.currentValue = value;
		this.setter.call(this.target, this.target, value, this);
	}

	/**
	 * 获取当前播放时间对应的值
	 * @returns
	 */
	getValue() {
		const b = this.beginValue as number;
		const f = this.finishValue as number;
		const p = this.getValueProportion();

		return getPercentValue(b, f, p);
	}

	/**
	 * 返回当前值和上一帧的值的差值
	 * @returns
	 */
	getDelta() {
		this.lastValue =
			this.lastValue === undefined
				? (this.beginValue as number)
				: this.lastValue;
		return this.currentValue - this.lastValue;
	}

	/**
	 * 获取当前播放时间
	 * @returns
	 */
	getPlayTime() {
		return this.rollbacking ? this.duration - this.time : this.time;
	}

	/**
	 * 获得当前播放时间对应值的比例，取值区间为 [0, 1]；该值实际上是时间比例值经过缓动函数计算之后的值。
	 * @returns
	 */
	getValueProportion() {
		return this.easing(this.getPlayTime(), 0, 1, this.duration);
	}

	/**
	 * 设置时间线的重复选项
	 * @param repeat  是否重复播放，设置为 true 无限循环播放，设置数值则循环指定的次数
	 * @param rollback 指示是否要回滚播放。如果设置为真，则一个来回算一次循环次数，否则播放完成一次算一次循环次数
	 */
	repeat(repeat: number | boolean, rollback: boolean) {
		this.repeatOption = repeat;
		this.rollback = rollback;
		return this;
	}

	/**
	 * 循环次数递减
	 */
	private decreaseRepeat() {
		if (typeof this.repeatOption === "number") {
			this.repeatOption--;
		}
	}

	/**
	 * 播放
	 */
	play() {
		const lastStatus = this.status;
		this.status = "playing";

		switch (lastStatus) {
			case "ready":
				if (typeof this.beginValue === "function") {
					this.beginValue = this.beginValue.call(this.target, this.target);
				}
				if (typeof this.finishValue === "function") {
					this.finishValue = this.finishValue.call(this.target, this.target);
				}
				this.time = 0;
				this.setValue(this.beginValue);
				this.frame = requestFrame(this.nextFrame.bind(this));
				break;
			case "finished":
			case "stoped":
				this.time = 0;
				this.frame = requestFrame(this.nextFrame.bind(this));
				break;
			case "paused":
				this.frame?.next();
		}
		return this;
	}

	/**
	 * 暂停播放
	 */
	pause() {
		this.status = "paused";

		releaseFrame(this.frame);

		return this;
	}

	/**
	 * 停止播放
	 */
	stop() {
		this.status = "stoped";
		this.setValue(this.finishValue);
		this.rollbacking = false;

		releaseFrame(this.frame);
		return this;
	}

	/**
	 * 播放结束之后的处理
	 */
	private timeUp() {
		if (this.repeatOption) {
			this.time = 0;
			if (this.rollback) {
				if (this.rollbacking) {
					this.decreaseRepeat();
					this.rollbacking = false;
				} else {
					this.rollbacking = true;
				}
			} else {
				this.decreaseRepeat();
			}

			if (!this.repeatOption) {
				this.finish();
			}
		} else {
			this.finish();
		}
	}

	/**
	 * 完成播放
	 */
	private finish() {
		this.setValue(this.finishValue);
		this.status = "finished";

		releaseFrame(this.frame);
	}
}
