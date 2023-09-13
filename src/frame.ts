/**
 * 提供动画帧的基本支持
 */

export const requestAnimationFrame: any =
	window.requestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function (fn: Function) {
		return setTimeout(fn, 1000 / 60);
	};

export const cancelAnimationFrame =
	window.cancelAnimationFrame ||
	window.mozCancelAnimationFrame ||
	window.webkitCancelAnimationFrame ||
	window.msCancelAnimationFrame ||
	window.clearTimeout;

export type Frame = {
	index: number;
	dur: number;
	time: number;
	elapsed: number;
	action: Function;
	next: Function;
};

// 上一次请求的原生动画id
let frameRequestId: any;

// 等待执行的帧动作的集合，这些帧的方法将在下个原生动画帧同步执行
let pendingFrames: Frame[] = [];

export function pushFrames(frame: Frame) {
	if ([pendingFrames.push(frame)]) {
		frameRequestId = requestAnimationFrame(executePendingFrames);
	}
}

/**
 * 执行所有等待帧
 */
export function executePendingFrames() {
	const frames = pendingFrames;
	pendingFrames = [];
	while (frames.length) {
		executeFrame(frames.pop()!);
	}
	frameRequestId = 0;
}

/**
 * 请求一个帧，执行指定的动作。动作回调提供一些有用的信息
 * @param action
 * @returns
 */
export function requestFrame(action: Function) {
	const frame = initFrame(action);
	pushFrames(frame);
	return frame;
}

/**
 * 释放一个已经请求过的帧，如果该帧在等待集合里，将移除，下个动画帧不会执行释放的帧
 * @param frame
 */
export function releaseFrame(frame?: Frame) {
	if (!frame) return;
	const index = pendingFrames.indexOf(frame);
	if (~index) {
		pendingFrames.splice(index, 1);
	}
	if (pendingFrames.length === 0) {
		cancelAnimationFrame(frameRequestId);
	}
}

/**
 * 初始化一个帧
 * @param action
 * @returns
 */
function initFrame(action: Function) {
	const frame: Frame = {
		index: 0,
		dur: 0,
		time: +new Date(),
		elapsed: 0,
		action: action,
		next: function () {
			pushFrames(frame);
		},
	};
	return frame;
}

/**
 * 执行一个帧动作
 */
function executeFrame(frame: Frame) {
	// 当前帧时间错
	const time = +new Date();

	// 上一帧到当前帧经过的时间
	let dur = time - frame.time;

	//
	// http://stackoverflow.com/questions/13133434/requestanimationframe-detect-stop
	// 浏览器最小化或切换标签，requestAnimationFrame 不会执行。
	// 检测时间超过 200 ms（频率小于 5Hz ） 判定为计时器暂停，重置为一帧长度
	//
	if (dur > 200) {
		dur = 1000 / 60;
	}

	frame.dur = dur;
	frame.elapsed += dur;
	frame.time = time;
	frame.action.call(null, frame);
	frame.index++;
}
