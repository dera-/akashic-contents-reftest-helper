interface MessageEventDataForScenario {
	type: "scenario";
	command: {
		name: "screenshot" | "finish";
		options?: any;
	};
}

/** runner側にスクリーンショットの保存を要求するためのメッセージ */
export const SCREENSHOT_NOTIFICATION_MESSAGE = "akashic-contents-reftest:image";
/** runner側にコンテンツ実行終了を要求するためのメッセージ */
export const END_NOTIFICATION_MESSAGE = "akashic-contents-reftest:finish";

if (typeof g !== "undefined") {
	const handleScenario = (msg: g.MessageEvent) => {
		if (msg.data?.type === "scenario" && msg.data.command) {
			const eventData = msg.data as MessageEventDataForScenario;
			switch (eventData.command.name) {
				case "screenshot":
					if (typeof window !== "undefined") {
						g.game.render(); // 描画がスキップされてしまうことがあるので、スクリーンショット取得前に現フレームでの描画を行う
						const canvasElements = window.document.getElementsByTagName("canvas");
						const imageUrl = canvasElements[0].toDataURL("image/png");
						const data = imageUrl.match(/^data:image\/png;base64,(.+)$/);
						if (data.length === 2) {
							console.log(SCREENSHOT_NOTIFICATION_MESSAGE, eventData.command.options.fileName, data[1]);
						}
					}
					break;
				case "finish":
					console.log(END_NOTIFICATION_MESSAGE);
					break;
				default:
					throw new Error(`${eventData.command.name} is undefined.`);
			}
		}
	};

	g.game._sceneChanged.add((scene: g.Scene) => {
		if (!scene.message.contains(handleScenario)) {
			scene.message.add(handleScenario);
		}
	});
}
