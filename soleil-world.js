const game = document.getElementById("game");
const avatar = document.getElementById("avatar");
const placeTitle = document.getElementById("placeTitle");
const placeText = document.getElementById("placeText");
const atsushiText = document.getElementById("atsushiText");

const state = {
  x: 70,
  y: 300,
  speed: 18,
};

const places = [
  {
    id: "gate",
    name: "丘の入口",
    x: 90,
    y: 320,
    radius: 95,
    text: "白い石畳の先に、ひまわりの丘公園が見えています。風はやわらかく、まだ一日は始まったばかりです。",
    atsushi: "まずは、ゆっくり奥まで歩いてみようか。"
  },
  {
    id: "flowers",
    name: "ひまわり花壇",
    x: 165,
    y: 165,
    radius: 100,
    text: "背の高いひまわりが、丘の光を受けて静かに揺れています。花壇の奥には小さな木札が立っています。",
    atsushi: "ここは、ソレイユの丘の気配がいちばん分かりやすい場所だね。"
  },
  {
    id: "cafe",
    name: "公園カフェ",
    x: 480,
    y: 230,
    radius: 100,
    text: "木陰のそばに、小さな公園カフェがあります。テラス席には、まだ誰も座っていません。",
    atsushi: "歩き疲れたら、ここで珈琲にしよう。今日は少し甘いものもいいかも。"
  },
  {
    id: "terrace",
    name: "展望テラス",
    x: 330,
    y: 70,
    radius: 95,
    text: "展望テラスからは、丘の道と花壇、遠くの屋根まで見渡せます。風が少しだけ高くなりました。",
    atsushi: "ここに来ると、今どこにいるのかが見えるね。"
  },
  {
    id: "diary",
    name: "ソレイユ日誌入口",
    x: 555,
    y: 320,
    radius: 90,
    text: "小さなアーチの先に、ソレイユ日誌へ続く扉があります。今日の記録を残す場所です。",
    atsushi: "歩いたあとに書く日誌は、少し言葉が変わるかもしれないね。"
  }
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function render() {
  const rect = game.getBoundingClientRect();
  const avatarSize = 42;
  state.x = clamp(state.x, 0, rect.width - avatarSize);
  state.y = clamp(state.y, 0, rect.height - avatarSize);

  avatar.style.left = state.x + "px";
  avatar.style.top = state.y + "px";

  updatePlace(rect);
}

function updatePlace(rect) {
  const scaleX = rect.width / 680;
  const scaleY = rect.height / 510;
  const centerX = state.x + 21;
  const centerY = state.y + 21;

  let nearest = null;
  let nearestDistance = Infinity;

  for (const place of places) {
    const px = place.x * scaleX;
    const py = place.y * scaleY;
    const distance = Math.hypot(centerX - px, centerY - py);

    if (distance < place.radius * Math.min(scaleX, scaleY) && distance < nearestDistance) {
      nearest = place;
      nearestDistance = distance;
    }
  }

  if (nearest) {
    placeTitle.textContent = nearest.name;
    placeText.textContent = nearest.text;
    atsushiText.textContent = nearest.atsushi;
  }
}

function move(dx, dy) {
  state.x += dx * state.speed;
  state.y += dy * state.speed;
  render();
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "arrowup" || key === "w") move(0, -1);
  if (key === "arrowdown" || key === "s") move(0, 1);
  if (key === "arrowleft" || key === "a") move(-1, 0);
  if (key === "arrowright" || key === "d") move(1, 0);
});

document.getElementById("up").addEventListener("click", () => move(0, -1));
document.getElementById("down").addEventListener("click", () => move(0, 1));
document.getElementById("left").addEventListener("click", () => move(-1, 0));
document.getElementById("right").addEventListener("click", () => move(1, 0));

window.addEventListener("resize", render);
render();
