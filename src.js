document.getElementById("passwordForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const enteredPassword = document.getElementById("password").value;
    const correctPassword = "chucha326"; // Replace with your actual password

    if (enteredPassword === correctPassword) {
        document.getElementById("passwordContainer").classList.add("hidden");
        document.getElementById("appContainer").classList.remove("hidden");
    } else {
        alert("Incorrect password. Access denied.");
    }
});

document
  .getElementById("scrapeForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    let link = document.getElementById("link").value;
    fetchContent(link);
  });

function fetchContent(link) {
  const corsProxy = "https://quiet-island-48032-994b7e102cf6.herokuapp.com/";
  fetch(corsProxy + link)
    .then((response) => response.text())
    .then((html) => {
      let parser = new DOMParser();
      let doc = parser.parseFromString(html, "text/html");

      processContent(doc);
    })
    .catch((error) => {
      console.error("Error fetching the content:", error);
    });
}

function processContent(doc) {
  let hasNm = 0; // Adjust this value as needed

  let data = doc.getElementsByClassName("card-subtitle");
  let skins = [];
  let battlePasses = [];

  let bpRegex = /[A-Za-z]*:[\s]+ACT[\s][0-9]+/g;
  for (let i = 0; i < data.length; i++) {
    let text = data[i].innerHTML.trim();
    if (bpRegex.exec(text)) {
      battlePasses.push(text);
      bpRegex.lastIndex = 0;
    } else {
      skins.push(text);
    }
  }
  let val = hasNm == 1 ? 6 : 0;
  skins.splice(0, 4 + val); // skips store items

  let episodes = [];
  let acts = doc.getElementsByClassName("list-item-heading");
  for (let i = 0; i < acts.length; i++) {
    let text = acts[i].innerHTML.trim().replace(" ", "");
    if (text.startsWith("EPISODE")) episodes.push(text);
  } //acts
  episodes = episodes.map((e) => e.split("-")[0].trim());
  // act ranks
  const rankmap = {
    0: "Unranked",
    3: "Iron 1",
    4: "Iron 2",
    5: "Iron 3",
    6: "Bronze 1",
    7: "Bronze 2",
    8: "Bronze 3",
    9: "Silver 1",
    10: "Silver 2",
    11: "Silver 3",
    12: "Gold 1",
    13: "Gold 2",
    14: "Gold 3",
    15: "Platinum 1",
    16: "Platinum 2",
    17: "Platinum 3",
    18: "Diamond 1",
    19: "Diamond 2",
    20: "Diamond 3",
    21: "Ascendant 1",
    22: "Ascendant 2",
    23: "Ascendant 3",
    24: "Immortal 1",
    25: "Immortal 2",
    26: "Immortal 3",
    27: "Radiant",
  };

  let rankRegex = /[\/][0-9]+[\/]/g;
  let actRanks = doc.getElementsByClassName("list-thumbnail");
  const ranks = [];
  for (let i = 0; i < actRanks.length; i++) {
    let url = actRanks[i].src;
    let match = rankRegex.exec(url);
    if (match) {
      ranks.push(match[0].replaceAll("/", ""));
      rankRegex.lastIndex = 0;
    }
  }


  let finalRanks = {};
  for (let i = 0; i < episodes.length; i++) {
    let rankVal = Number(ranks[i]);
    if (episodes[i] in finalRanks) {
      if (finalRanks[episodes[i]] < rankVal) {
        finalRanks[episodes[i]] = rankVal;
      }
    } else {
      finalRanks[episodes[i]] = rankVal;
    }
  }
  Object.keys(finalRanks).map((e) => (finalRanks[e] = rankmap[finalRanks[e]]));

  //level
  var accountProgressElement = doc.getElementById("account-progress");
  var h4Element = accountProgressElement.getElementsByTagName("h4")[0];
  var level = h4Element.textContent;

  // VP + RP
  let currencies = [];
  let pTags = doc.getElementsByTagName("p");
  for (let i = 0; i < pTags.length; i++) {
    if (pTags[i].classList.length == 0) currencies.push(pTags[i].innerHTML);
  }

  let vp = currencies[0];
  let rp = currencies[1];

  let skinsData = {
    skins: skins,
    battlePasses: battlePasses,
    ranks: finalRanks,
    level: level,
    vp: vp,
    rp: rp,
  };

  displayContent(skinsData);
}

function displayContent(skinsData) {
  let content = `❤️ In-Game Details ❤️\n\n🖤 WEAPON SKINS 🖤\n\n`;

  skinsData.skins.forEach((skin) => {
    content += `   ✅ ${skin}\n`;
  });

  content += `\n☑️ BATTLEPASS:\n`;

  skinsData.battlePasses.forEach((bp) => {
    content += `   ✅ ${bp}\n`;
  });

  content += `\n☑️ LAST ACT RANKs:\n`;
  for (let episode in skinsData.ranks) {
    content += `   ✅ ${episode}: ${skinsData.ranks[episode]}\n`;
  }

  content += `\n☑️ Account Level = ${skinsData.level}\n`;
  content += `☑️ ${skinsData.vp} EXTRA VP (VALORANT POINTS) IN ACCOUNT.\n`;
  content += `☑️ ${skinsData.rp} RP (RADIANITE POINTS) IN ACCOUNT.\n`;
  content += `\n☑️ AFTER BUYING YOU WILL RECEIVE: USERNAME, PASSWORD, EMAIL ACCESS.\n`;
  content += `\n⚠️If you face any issue or problem please message the seller, don't rush to give negative feedback, The seller will surely solve your problem.\n`;
  content += `\n(-AFTER BUYING PLEASE DROP GOOD FEEDBACK/REVIEW-)\n`;
  content += `\n======================================================================\n`;
  content += `\n📩 Post Purchase Instructions📩\n`;
  content += `\n🌐 Website for Email Login: https://mail.zsthost.com/\n`;
  content += `\n🙏 After buying, please change the email address to your own leave a good feedback after confirming the order. ❤️\n`;

  document.getElementById("content").value = content;
}

document.getElementById("copyButton").addEventListener("click", function () {
  let content = document.getElementById("content");
  content.select();
  content.setSelectionRange(0, 99999); // For mobile devices

  try {
    document.execCommand("copy");
    alert("Content copied to clipboard!");
  } catch (err) {
    alert("Failed to copy content.");
  }
});
