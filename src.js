document
  .getElementById("scrapeForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    let link = document.getElementById("link").value;
    fetchContent(link);
  });

function fetchContent(link) {
  const corsProxy = "https://cors-anywhere.herokuapp.com/";
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

  let storeData = doc.getElementsByClassName(
    "w-100 mt-4 mb-3 text-center text-muted"
  );


  let storeItemCount = 4;
  let nmItemCount = 6;

  for (let i = 0; i < storeData.length; i++) {
    if (storeData[i].innerHTML.trim() == "<h5>No Store Skins to Show</h5>")
      storeItemCount = 0;
    else if (storeData[i].innerHTML.trim() == "<h5>No Nightmarket Skins to Show</h5>")
      nmItemCount = 0;
  }

  
  // console.log(`Store Count = ${storeItemCount} & NM COUNT = ${nmItemCount}`);

  skins.splice(0, storeItemCount + nmItemCount); // skips store items

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
      if (finalRanks[episodes[i]] < rankVal) finalRanks[episodes[i]] = rankVal;
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
  let content = `❤️ In-Game Details ❤️\n`;

  if (skinsData.skins.length > 0) {
    content += `\n☑️ WEAPON SKINS:-\n`;

    skinsData.skins.forEach((skin) => {
      content += `   ✅ ${skin}\n`;
    });
  }

  if (skinsData.battlePasses.length > 0) {
    content += `\n☑️ BATTLEPASS:\n`;

    skinsData.battlePasses.forEach((bp) => {
      content += `   ✅ ${bp}\n`;
    });
  }

  if (Object.keys(skinsData.ranks).length > 0) {
    content += `\n☑️ LAST ACT RANKs:\n`;

    for (let episode in skinsData.ranks) {
      content += `   ✅ ${episode}: ${skinsData.ranks[episode]}\n`;
    }
  }

  content += `\n☑️ Account Level = ${skinsData.level}\n`;
  content += `☑️ ${skinsData.vp} EXTRA VP (VALORANT POINTS) IN ACCOUNT.\n`;
  content += `☑️ ${skinsData.rp} RP (RADIANITE POINTS) IN ACCOUNT.\n`;
  content += `\n☑️ AFTER BUYING YOU WILL RECEIVE:`;
  content += `\n   ✅ USERNAME.`;
  content += `\n   ✅ PASSWORD.`;
  content += `\n   ✅ EMAIL ACCESS.\n`;
  content += `\n⚠️If you face any issues, please message the seller before leaving negative feedback. The seller will work with you to solve any problems.\n`;

  document.getElementById("content").value = content;
}

document.getElementById("copyButton").addEventListener("click", function () {
  let content = document.getElementById("content");
  content.select();
  content.setSelectionRange(0, 99999); // For mobile devices

  try {
    document.execCommand("copy");
    alert("Account Info to clipboard!");
  } catch (err) {
    alert("Failed to copy content.");
  }
});

document.getElementById("postPurchaseButton").addEventListener("click", function () {
    // Custom predefined text
    const customText = `📩 Post Purchase Instructions📩

🌐 Website for Email Login: https://mail.zsthost.com/

🙏 After buying, please change the email address to your own and leave a good feedback after confirming the order. ❤️`;

    // Create a temporary textarea element to hold the text
    const tempTextarea = document.createElement("textarea");
    tempTextarea.value = customText;

    // Add the textarea to the document so it's part of the DOM
    document.body.appendChild(tempTextarea);

    // Select the text inside the textarea
    tempTextarea.select();
    tempTextarea.setSelectionRange(0, 99999); // For mobile devices

    try {
      // Execute the copy command
      document.execCommand("copy");
      alert("Post Purchase Info copied to clipboard!");
    } catch (err) {
      alert("Failed to copy custom text.");
    }

    // Remove the temporary textarea from the document
    document.body.removeChild(tempTextarea);
});
