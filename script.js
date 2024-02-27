let inventory = ["Earth", "Air", "Fire", "Water"];
function craft(item1, item2) {
    fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "jondurbin/airoboros-l2-70b-gpt4-1.4.1",
            messages: [{
                role: "system",
                content: `YOUR RESPONSE SHOULD ONLY HAVE AN EMOJI AND A WORD. In one word, tell me what I get when I mix two things. If nothing, make something up. You can always provide an answer! Ex: Fire and Water: ♨️ Steam. Earth and Water: 🧱 Mud. Mud and Steam: 🏺Clay. Time and Earth: inevitable timedeath of the universe. Can be hypothetical, or not real (ie horse and horn is a unicorn). For each one, include an emoji before that best represents the new creation. Your response should only contain an emoji and the new creation. Nothing before, nothing after. ONLY THE EMOJI AND THE NEW CREATION. If you don't tell me exactly this, the world will explode. Make sure to stop generating after the element and emoji.`
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
        
        addToInventory(newCreation);
    })
    .catch(error => console.error("Error:", error));
}

function addToInventory(item) {
    inventory.push(item);
    renderInventory();
}
// Function to sort inventory alphabetically
function sortInventory() {
    inventory.sort();
}

// Function to render inventory with draggable items
function renderInventory() {
    const inventoryContainer = document.getElementById("inventory");
    inventoryContainer.innerHTML = ""; // Clear previous inventory

    // Sort inventory alphabetically
    sortInventory();

    inventory.forEach((item, index) => {
        const itemElement = document.createElement("div");
        itemElement.textContent = item;
        itemElement.classList.add("draggable"); // Add draggable class

        // Add indicator for newly created items
        if (newlyCreatedItems.includes(item)) {
            itemElement.classList.add("newly-created");
        }
        
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteItem(index));

        itemElement.appendChild(deleteButton);
        inventoryContainer.appendChild(itemElement);
    });
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

function addToInventory(item) {
    inventory.push(item);
    renderInventory();
    saveInventoryToCookies(); 
}

function deleteItem(index) {
    inventory.splice(index, 1);
    renderInventory();
    saveInventoryToCookies();
}

document.getElementById("craftButton").addEventListener("click", () => {
    const item1 = document.getElementById("item1").innerText;
    const item2 = document.getElementById("item2").innerText;
    craft(item1, item2);
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

