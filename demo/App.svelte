<script lang="ts">
	import { onMount } from "svelte";
	import Animator from "src/Animator";
	let basic: any = null;
	let rect: any = null;
	let circle: any = null;
	onMount(() => {
		console.log("组件挂载完成");
		setTimeout(() => {
			new Animator({
				beginValue: { x: -15, y: -15 },
				finishValue: { x: 185, y: 185 },
				setter(target, value) {
					target.style.left = value.x + "px";
					target.style.top = value.y + "px";
				},
			}).start(basic, {
				duration: 1000, // ms
				easing: "ease",
				delay: 0,
			});
			new Animator({
				beginValue: -135,
				finishValue: 225,
				setter(target, angle) {
					const r = 100;
					const center = {
						x: 100,
						y: 100,
					};
					const point = {
						x: center.x + r * Math.cos((angle * Math.PI) / 180),
						y: center.y + r * Math.sin((angle * Math.PI) / 180),
					};
					target.style.left = point.x - 15 + "px";
					target.style.top = point.y - 15 + "px";
				},
			})
				.start(circle, {
					duration: 3000, // ms
					easing: "ease",
					delay: 0,
				})
				.repeat(1, false);
			new Animator({
				beginValue: () => ({ x: -15, y: -15 }),
				finishValue: () => ({ x: 185, y: -15 }),
				setter(target, value) {
					target.style.left = value.x + "px";
					target.style.top = value.y + "px";
				},
			})
				.pipe({
					beginValue: -15,
					finishValue: 185,
					setter(target, value) {
						target.style.top = value + "px";
					},
				})
				.pipe({
					beginValue: 185,
					finishValue: -15,
					setter(target, value) {
						target.style.left = value + "px";
					},
				})
				.pipe({
					beginValue: 185,
					finishValue: -15,
					setter(target, value) {
						target.style.top = value + "px";
					},
				})
				.start(rect, {
					duration: 3000, // ms
					easing: "ease",
					delay: 0,
				})
				.repeat(1, false);
		}, 1000);
	});
</script>

<div class="container">
	<div class="rect">
		<div class="inner" bind:this={basic} />
	</div>
	<div class="rect">
		<div class="inner" bind:this={rect} />
	</div>
	<div class="circle">
		<div class="inner" bind:this={circle} />
	</div>
</div>

<style lang="less">
	.container {
		width: 100%;
		height: 100%;
		background-color: aliceblue;
		padding: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 100px;
	}
	.rect {
		width: 200px;
		height: 200px;
		background-color: #fff;
		position: relative;
		.inner {
			width: 30px;
			height: 30px;
			left: -15px;
			top: -15px;
			border-radius: 50%;
			background-color: aqua;
			padding: 20px;
			position: absolute;
			opacity: 0.5;
		}
	}
	.circle {
		width: 200px;
		height: 200px;
		border-radius: 50%;
		background-color: #fff;
		position: relative;
		.inner {
			width: 30px;
			height: 30px;
			left: -15px;
			top: -15px;
			border-radius: 50%;
			background-color: aqua;
			padding: 20px;
			position: absolute;
			opacity: 0.5;
		}
	}
</style>
