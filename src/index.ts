interface Command {
	name: string;
	options: any;
}

interface Scenario {
	age: number;
	commands: Command[];
}

const runScenario = (scene: g.Scene, commands: Command[]): void => {
	for (var i = 0; i < commands.length; i++) {
		var com = commands[i];
		switch (com.name) {
		case "click":
			var point = { x: com.options.x, y: com.options.y };
			var pointSource = scene.findPointSourceByPoint(point);
			var targetPoint = pointSource.point || point;
			g.game.raiseEvent(new g.PointDownEvent(0, pointSource.target, targetPoint));
			g.game.raiseEvent(new g.PointUpEvent(0, pointSource.target, targetPoint, { x: 0, y: 0 }, { x: 0, y: 0 }));
			break;
		case "screenshot":
			if (typeof window !== "undefined") {
			var canvasElements = window.document.getElementsByTagName("canvas");
			var imageUrl = canvasElements[0].toDataURL("image/png");
			var data = imageUrl.match(/^data:image\/png;base64,(.+)$/);
			if (data.length === 2) {
				console.log("akashic-contents-reftest:image", com.options.fileName, data[1]); // saveScreenshots側にスクリーンショットの保存を要求
			}
			}
			break;
		case "finish":
			console.log("akashic-contents-reftest:finish"); // saveScreenshots側にコンテンツ実行終了を通知
			break;
		}
	}
};

export const init = (scene: g.Scene): void => {
	let scenarioTable: Scenario[] = [];
	const runScenarioEvent = () => {
		var target = scenarioTable.filter(function (scenario) {
		  return scenario.age === g.game.age
		});
		if (target.length > 0) {
		  runScenario(g.game.scene(), target[0].commands);
		}
	};
	scene.message.add((msg) => {
		if (msg.data && msg.data.type === "scenario" && msg.data.scenarioTable) {
			scenarioTable = msg.data.scenarioTable;
		}
	});
	// game単位でのイベント登録ができないので、sceneが変わるたびにイベントを登録する必要がある
	g.game._sceneChanged.add((s) => {
		if (s && s.update && !s.update.contains(runScenarioEvent)) {
			s.update.add(runScenarioEvent);
		}
	});
};
