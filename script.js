let inventory = ["🌎 Earth", "💨 Air", "🔥 Fire", "💧 Water"];
function craft(item1, item2) {
  fetch("emojis.txt") // Assuming emojis.txt is in the same directory containing emoji data
    .then(response => response.text())
    .then(text => {
        const emojis = text.split('\n').map(line => {
        const parts = line.split('\t');
        return { name: parts[1].trim(), char: parts[0].trim() };
      });

        // Initialize Fuse.js instance with emoji data
      const fuse = new Fuse(emojis, { keys: ["name"], threshold: 0.4 });

      const item2Emoji = fuzzySearchEmoji(item2, fuse);
      if (!item2Emoji) {
        console.log("Emoji not found for:", item2);
        return;
      }

      fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "jondurbin/airoboros-l2-70b-gpt4-1.4.1",
          messages: [{
            role: "system",
            content: `YOUR RESPONSE SHOULD ONLY HAVE A WORD. In one word, tell me what I get when I mix two things. If nothing, make something up. It can be crazy or unhinged. You can always provide an answer! Ex: Fire and Water: Steam. Earth and Water: Mud. Mud and Steam: Clay. Time and Earth: inevitable timedeath of the universe. Can be hypothetical, or not real (ie horse and horn is a unicorn). Your response should only contain the new creation. Nothing before, nothing after. If you don't tell me exactly this, the world will explode. Make sure to stop generating after the element and emoji.`
          }, {
            role: "user",
            content: `${item1.replace("Delete", "")} and ${item2}`
          }]
        })
      })
      .then(response => response.json())
      .then(data => {
        var newCreation = "";
        if (data.choices[0].message.content.includes("\n")){
          newCreation = data.choices[0].message.content.split("\n")[0].trim();
        } else {
          newCreation = data.choices[0].message.content.trim();
        }

        addToInventory(newCreation + ' ' + item2Emoji);
      })
      .catch(error => console.error("Error:", error));
    })
    .catch(error => console.error("Error fetching emoji data:", error));
}

    // Function to perform fuzzy search for emoji
function fuzzySearchEmoji(text, fuse) {
    const result = fuse.search(text);
    return result.length > 0 ? result[0].item.char : null;
}
function filterInventory() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    const inventoryItems = document.querySelectorAll(".inventory > div");
    inventoryItems.forEach(item => {
        const itemName = item.textContent.toLowerCase();
        if (itemName.includes(searchInput)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}
// Function to handle scroll event
function handleScroll() {
    const searchInput = document.getElementById("searchInput");
    const inventory = document.getElementById("inventory");
    const inventoryTop = inventory.getBoundingClientRect().top;

    if (window.scrollY >= inventoryTop) {
        searchInput.style.display = "none";
    } else {
        searchInput.style.display = "block";
    }
}

// Event listener for scroll event
window.addEventListener("scroll", handleScroll);

// Function to enable typing in the search box
function enableTyping() {
    const searchInput = document.getElementById("searchInput");
    searchInput.removeAttribute("disabled");
}

// Event listener for focus event on search input
document.getElementById("searchInput").addEventListener("focus", enableTyping);

// Event listener for search input
document.getElementById("searchInput").addEventListener("input", filterInventory);
function addToInventory(item) {
    inventory.push(item);
    renderInventory();
}
// Function to sort inventory alphabetically
function sortInventory() {
    inventory.sort((a, b) => a.localeCompare(b));
}

// Function to render inventory with draggable items
// Function to render inventory with draggable items sorted alphabetically
function renderInventory() {
    const inventoryContainer = document.getElementById("inventory");
    inventoryContainer.innerHTML = ""; // Clear previous inventory

    // Sort inventory alphabetically based on the first character of element name
    inventory.sort((a, b) => a.charAt(0).localeCompare(b.charAt(0)));

    inventory.forEach((item, index) => {
        const itemElement = document.createElement("div");
        itemElement.textContent = item;
        itemElement.classList.add("draggable"); // Add draggable class
        itemElement.setAttribute("draggable", "true");
        itemElement.addEventListener("dragstart", dragStart);
        
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteItem(index));

        itemElement.appendChild(deleteButton);
        inventoryContainer.appendChild(itemElement);
    });
}

// Function to create a new item with an indicator
function createNew(item) {
    const craftingContainer = document.querySelector(".crafting-container");
    const newIndicator = document.createElement("div");
    newIndicator.textContent = `Created: ${item}`;
    craftingContainer.insertBefore(newIndicator, craftingContainer.firstChild);
    setTimeout(() => {
        craftingContainer.removeChild(newIndicator);
    }, 3000); // Remove the indicator after 3 seconds
}

// Function to add item to inventory
function addToInventory(item) {
    inventory.push(item);
    renderInventory();
    saveInventoryToCookies(); // Save inventory to cookies
    createNew(item); // Add indicator for newly created item
}
function saveInventoryToCookies() {
    document.cookie = "inventory=" + JSON.stringify(inventory) + "; expires=" + new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString() + "; path=/";
}

function loadInventoryFromCookies() {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'inventory') {
            inventory = JSON.parse(value);
            renderInventory();
            break;
        }
    }
}

window.addEventListener('load', loadInventoryFromCookies);


function deleteItem(index) {
    inventory.splice(index, 1);
    renderInventory();
    saveInventoryToCookies();
}

document.getElementById("craftButton").addEventListener("click", () => {
    document.getElementById("craftButton").innerText = "Crafting...";
    const item1 = document.getElementById("item1").innerText;
    const item2 = document.getElementById("item2").innerText;
    craft(item1, item2);
    document.getElementById("craftButton").innerText = "Craft";
});

function dragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.innerText);
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text/plain");
    event.target.innerText = data.replace("Delete", "");
}

function renderInventory() {
    const inventoryContainer = document.getElementById("inventory");
    inventoryContainer.innerHTML = ""; 

    inventory.forEach((item, index) => {
        const itemElement = document.createElement("div");
        itemElement.textContent = item;
        itemElement.classList.add("draggable");
        itemElement.setAttribute("draggable", "true");
        itemElement.addEventListener("dragstart", dragStart);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteItem(index));

        itemElement.appendChild(deleteButton);
        inventoryContainer.appendChild(itemElement);
    });
}

renderInventory();

