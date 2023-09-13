declare namespace Animation {
	export type Easing = (
		currentValue: number,
		beginValue: number,
		finishValue: number,
		duration: number
	) => number;
}

declare namespace Timeline {
	export type Setter = (target: any, value: any, timeline: Timeline) => void;
}
