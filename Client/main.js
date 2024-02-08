// Copyright (c) 2023 xquadz0@gmail.com
// All rights reserved.
// See LICENSE.txt for license information.
// littlechemistry.online/LICENSE.txt

console.log("%cView License: %chttp://littlechemistry.online/LICENSE.txt", "color: white;", "color: gray; text-decoration: underline;");
let idCounter = 0;
let zCounter = 9999;
let activeElement = null;
let recipies = {};
let mouseOffsetX = 0;
let mouseOffsetY = 0;


// UTIL
let elements = ["Fire","Water","Earth","Air"];

// Check if the element is overflowing


function isOverflowing(element,size) {
    // Create a temporary span element
    var tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden'; // Make it invisible
    tempSpan.innerHTML = element.innerHTML;
    tempSpan.style.fontSize = element.style.fontSize;
    document.body.appendChild(tempSpan);

    var isOverflowing = false;
    // Compare the widths
    if (tempSpan.offsetWidth > 150) {
        isOverflowing = true;
    }
    
    tempSpan.remove();
    // Clean up the temporary element

    return isOverflowing;
}

// If the element is overflowing, decrease the font size
function resizeFont(element,size) {
    var fontSize = parseFloat(window.getComputedStyle(element).fontSize) || 16;
    while (isOverflowing(element,size) && fontSize > 13) {
        fontSize--;
        element.style.fontSize = fontSize + 'px';
    }

    if (isOverflowing(element,size)) {
        element.style.lineHeight = '11px';
    }
}

function createElementDiv(elementName) {
    let div = document.createElement("div");
    div.className = "element-container";

    let img = document.createElement("img");
    img.src = `/get-element-image/${elementName}`;
    img.className = "element-image";
    img.draggable = false;
    div.appendChild(img);

    let span = document.createElement("span");
    span.className = "element";
    span.textContent = elementName;
    div.appendChild(span);

    return div;
}

function createElements() {
    let elements = ['Fire', 'Water', 'Earth', 'Air'];
    elements.forEach((elementName) => {
        let div = createElementDiv(elementName);
        document.querySelector(".scrollable-div").appendChild(div);
    });
}
createElements();

function cloneElementDiv(elementDiv) {
    let newDiv = createElementDiv(elementDiv.querySelector(".element").textContent);
    newDiv.style.position = "absolute";
    newDiv.dataset.listeners = "false";
    newDiv.dataset.id = idCounter++;
    return newDiv;
}

function createNewElement(name, left, top, selectable = true) {
    let div = createElementDiv(name);
    document.querySelector(".scrollable-div").appendChild(div);
    
    div.style.left = left;
    div.style.top = top;
    div.style.position = "absolute";
    div.style.pointerEvents = selectable ? "auto" : "none";

    div.style.position = "absolute";
    div.dataset.listeners = "false";
    div.dataset.id = idCounter++;

    // Modify activeElement (element-container)
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.alignItems = "center";
    div.style.backgroundColor = "#2e3136";
    div.style.marginBottom = "10px";
    div.style.padding = "10px";
    div.style.borderRadius = "10px";
    div.style.transition = "background-color 0.3s";
    div.style.cursor = "pointer";
    div.style.userSelect = "none";
    div.style.width = "105px"; // adjust the width as per your needs
    div.style.height = "145px";

    // Modify child .element
    let childElement = div.querySelector(".element");
    childElement.style.display = "flex";
    childElement.style.flexDirection = "column";
    childElement.style.justifyContent = "center"; // centers children along the column direction
    childElement.style.margin = "5px 0";
    childElement.style.backgroundColor = "#ccc";
    childElement.style.borderRadius = "5px";
    childElement.style.transition = "background-color 0.3s";
    childElement.style.cursor = "pointer";
    childElement.style.userSelect = "none";
    childElement.style.width = "90px";
    childElement.style.height = "25px";
    childElement.style.padding = "5px";
    childElement.style.textAlign = "center";

    // Modify child .element-image
    let childImage = div.querySelector(".element-image");
    childImage.style.width = "100px";
    childImage.style.height = "100px";
    childImage.style.backgroundSize = "cover";
    childImage.style.userDrag = "none";
    childImage.style.webkitUserDrag = "none";
    childImage.style.userSelect = "none";
    childImage.style.mozUserSelect = "none";
    childImage.style.webkitUserSelect = "none";
    childImage.style.msUserSelect = "none";
    document.body.appendChild(div);

    queryElements();

    if (!selectable && name !== "..." && !isElementInSidebar(name)) {
        addToSidebar(name);
    }

    resizeFont(childElement,90);

  return div;
}

function addToSidebar(name) {
    let div = createElementDiv(name);
    resizeFont(div.querySelector(".element"),140);
    document.querySelector(".scrollable-div").appendChild(div);
    elements.push(name);
}

var mouseX, mouseY;
document.onmousemove = function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    document.querySelector(".stardust-counter").textContent = stardust;
};

let currentMouseElement = null;
function mouseOverTrash() {
    if (typeof mouseX === 'undefined' || typeof mouseY === 'undefined') {return false;}
    var elementMouseIsOver = document.elementFromPoint(mouseX, mouseY);
    currentMouseElement = elementMouseIsOver;
    if(elementMouseIsOver && elementMouseIsOver.className === 'trash-icon'){
        // Do something
        return true;
    }
    return false;
}

let isMouseOverTrash = false;
setInterval(() => {
    isMouseOverTrash = mouseOverTrash();
}, 5);

let clonedFolderTab = null;

function folderDisplay(element) {
            if (!element.querySelector(".trash-icon") && foldersOn || isShiftKeyDown && !element.querySelector(".trash-icon")) {
                let div = document.createElement('div');
                div.className = "trash-icon-holder";

                let span = element.querySelector(".element");
                span.style.width = "50%";

                let trashImg = document.createElement('img');
                trashImg.className = "trash-icon";
                trashImg.draggable = false;
                trashImg.style.border = "none"; // Add this to remove any border from the image
                trashImg.src = 'images/folder.png';
                trashImg.style.width = '50px';
                trashImg.style.height = 'auto';
                div.appendChild(trashImg);

                div.addEventListener('click',function (event) {
                    if (clonedFolderTab !== null) {clonedFolderTab.remove(); clonedFolderTab = null};
                    let clonedTab = document.querySelector(".folder-tab").cloneNode(true);
                    if (mouseY > screenHeight - 150) {
                        clonedTab.style.top = mouseY - 150 + 'px';
                    } else {
                        clonedTab.style.top = mouseY + 'px';
                    }
                    clonedTab.style.left = mouseX - 175 + 'px';
                    clonedTab.style.display = "block";
                    clonedTab.style.borderRadius = '5px';
                    clonedTab.style.height = '150px';
                    document.body.appendChild(clonedTab);
                    clonedFolderTab = clonedTab;
                    
                    if (typeof element.dataset.folder === 'undefined') {element.dataset.folder = "All Elements";}
                    for (const child of clonedTab.children) {
                        child.style.transition = 'background-color 0.3s';
                        
                        if (element.dataset.folder === child.textContent) {
                            child.style.cursor = 'auto';
                            child.style.userSelect = 'none';
                        } else {
                            child.style.color = '#1c1c1e';
                            child.style.backgroundColor = '#373b41';

                            child.addEventListener('mouseover', () => {
                                child.style.backgroundColor = '#ccc';
                                child.style.color = 'black';
                            });

                            child.addEventListener('mouseout', () => {
                                child.style.backgroundColor = '';
                                child.style.color = ''
                            });

                            child.addEventListener('click', () => {
                                element.dataset.folder = child.textContent;
                                filterElements();
                                clonedFolderTab.remove();

                                const dataKey = getCookie('dataKey');
                                if (dataKey) {
                                    saveFolders(dataKey);
                                }
                            });
                        }
                    }
                });

                element.appendChild(div);
                resizeFont(span,93);
            }
}

function folderUndisplay(element) {
            let span = element.querySelector(".element");
            span.style.width = "75%";
            span.style.fontSize = "16px";
            resizeFont(span,140);

            while (element.querySelector(".trash-icon")) {
                element.querySelector(".trash-icon").parentElement.remove();
            }
}

function queryElements() {
    checkChallenges();
    const elements = document.querySelectorAll(".element-container");
    elements.forEach((element) => {
        if (element.dataset.listeners === "true") {
            return;
        }

    element.dataset.listeners = "true";
    if (element.parentElement === document.querySelector(".scrollable-div")) {

        element.addEventListener('mouseover', function (event) {
            folderDisplay(element);
        });

        element.addEventListener('mouseleave', function (event) {
            folderUndisplay(element);
        });
    }

    if (element.parentElement !== document.querySelector(".scrollable-div")) {
        element.addEventListener('dblclick', function (event) {
            
    let clonedElement = element.cloneNode(true);
    
    let elementRect = element.getBoundingClientRect();
    clonedElement.style.left = `${elementRect.left + 10}px`;
    clonedElement.style.top = `${elementRect.top - 10}px`;
    clonedElement.dataset.listeners = "false";
    document.body.appendChild(clonedElement);
    queryElements(); // Update event listeners for the cloned element
        });
    }


    element.addEventListener("mousedown", (e) => {
    if (clonedFolderTab !== null) {clonedFolderTab.remove(); clonedFolderTab = null};
    if (isMouseOverTrash) {return false;}
    let bool = false;
    
    if (element.parentElement === document.querySelector(".scrollable-div")) {
        activeElement = cloneElementDiv(element);
        

    activeElement.style.position = "absolute";
    activeElement.dataset.listeners = "false";
    activeElement.dataset.id = idCounter++;

    // Modify activeElement (element-container)
    activeElement.style.display = "flex";
    activeElement.style.flexDirection = "column";
    activeElement.style.alignItems = "center";
    activeElement.style.backgroundColor = "#2e3136";
    activeElement.style.marginBottom = "10px";
    activeElement.style.padding = "10px";
    activeElement.style.borderRadius = "10px";
    activeElement.style.transition = "background-color 0.3s";
    activeElement.style.cursor = "pointer";
    activeElement.style.userSelect = "none";
    activeElement.style.width = "105px"; // adjust the width as per your needs
    activeElement.style.height = "145px";

    // Modify child .element
    let childElement = activeElement.querySelector(".element");
    childElement.style.display = "flex";
    childElement.style.flexDirection = "column";
    childElement.style.justifyContent = "center"; // centers children along the column direction
    childElement.style.margin = "5px 0";
    childElement.style.backgroundColor = "#ccc";
    childElement.style.borderRadius = "5px";
    childElement.style.transition = "background-color 0.3s";
    childElement.style.cursor = "pointer";
    childElement.style.userSelect = "none";
    childElement.style.width = "90px";
    childElement.style.height = "25px";
    childElement.style.padding = "5px";
    childElement.style.textAlign = "center";

    // Modify child .element-image
    let childImage = activeElement.querySelector(".element-image");
    childImage.style.width = "100px";
    childImage.style.height = "100px";
    childImage.style.backgroundSize = "cover";
    childImage.style.userDrag = "none";
    childImage.style.webkitUserDrag = "none";
    childImage.style.userSelect = "none";
    childImage.style.mozUserSelect = "none";
    childImage.style.webkitUserSelect = "none";
    childImage.style.msUserSelect = "none";
    
        resizeFont(childElement,90);
        document.body.appendChild(activeElement);
        resetElementColorsAll();
        queryElements();
        bool = true;
    } else {
        activeElement = element;
    }

    activeElement.style.zIndex = zCounter;
    zCounter = zCounter+1;
    
    // Calculate offsets here, taking into account the scroll position of the parent
    mouseOffsetX = e.pageX - activeElement.getBoundingClientRect().left;
    mouseOffsetY = e.pageY - activeElement.getBoundingClientRect().top;

    if (bool) {
        mouseOffsetX = parseInt(activeElement.offsetWidth) / 2;
        mouseOffsetY = parseInt(activeElement.offsetHeight) / 2;
    }

    activeElement.style.left = e.clientX;
    activeElement.style.top = e.clientY;

    updateElementPosition(e);
});

});}
// change this later
document.addEventListener("mousemove", (e) => {
    screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    updateElementPosition(e);
    
    if (activeElement) {
        const collidedElement = checkCollision(activeElement);

        if (collidedElement && collidedElement.parentElement !== document.querySelector(".scrollable-div")) {
            collidedElement.style.backgroundColor = "#6d3f5b";
            resetElementColors(collidedElement);
        } else {
            resetElementColorsAll();
        }
    }
});

function resetElementColors(exclude) {
    document.querySelectorAll(".element-container").forEach((element) => {
        if (element.parentElement !== document.querySelector(".scrollable-div") && element !== exclude) {
            element.style.backgroundColor = "#2e3136";
        }
    });
}

function resetElementColorsAll() {
    document.querySelectorAll(".element-container").forEach((element) => {
        if (element.parentElement !== document.querySelector(".scrollable-div")) {
            element.style.backgroundColor = "#2e3136";
        }
    });
}


function updateElementPosition(e) {
    if (activeElement) {
        // Include offsets here
        activeElement.style.left = e.clientX - mouseOffsetX + "px";
        activeElement.style.top = e.clientY - mouseOffsetY + "px";
    }
}


let screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
let screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
document.addEventListener("mouseup", async (e) => {
    if (mouseX < screenWidth - 250 && clonedFolderTab !== null) {clonedFolderTab.remove(); clonedFolderTab = null;}
    if (activeElement) {
        resetElementColors();
        const sidebar = document.querySelector(".scrollable-div");
        const sidebarRect = sidebar.getBoundingClientRect();
        if (
            e.clientX >= sidebarRect.left &&
            e.clientX <= sidebarRect.right &&
            e.clientY >= sidebarRect.top &&
            e.clientY <= sidebarRect.bottom
        ) {
            activeElement.remove();
        } else {

        const collidedElement = checkCollision(activeElement);
        if (collidedElement && collidedElement.parentElement !== document.querySelector(".scrollable-div") && collidedElement.querySelector(".element")) {
            // Remove images associated with collided elements
            const loadingElement = document.createElement("span");
            loadingElement.className = "element";
            loadingElement.textContent = "..."
            loadingElement.style.position = "fixed";
            loadingElement.style.width = "50px";
            loadingElement.style.height = "30px";
            loadingElement.style.lineHeight = "25px";
            loadingElement.style.padding = "0px";
            loadingElement.style.margin = "0px";
            loadingElement.style.textAlignment = "center";
            loadingElement.style.left = parseInt(collidedElement.style.left) + collidedElement.offsetWidth/2 + 'px';
            loadingElement.style.top = parseInt(collidedElement.style.top) + collidedElement.offsetHeight/2 + 'px';
            loadingElement.style.pointerEvents = "none";
            document.body.appendChild(loadingElement);
            (async () => {
                try {
                    const newName = 
                        await getCombinedElement(collidedElement.querySelector(".element").textContent, activeElement.querySelector(".element").textContent);
                    
                    loadingElement.remove();
                    let newElement = createNewElement(newName, collidedElement.style.left, collidedElement.style.top, false);
                    newElement.style.pointerEvents = "auto";
                    queryElements();
                } catch (error) {
                    console.error("Error fetching combined element:", error);
                }
            })();
            collidedElement.remove();
            activeElement.remove();
        }
    } 
        queryElements();
        activeElement = null;
    }
});


function isElementInSidebar(name) {
    const sidebar = document.querySelector(".scrollable-div");
    const elements = sidebar.querySelectorAll(".element");
    for (const element of elements) {
        if (element.textContent === name) {
            return true;
        }
    }
  return false;
}

function checkCollision(element) {
    const elementRect = element.getBoundingClientRect();
    const elements = document.querySelectorAll(".element-container");
        for (let i = 0; i < elements.length; i++) {
            if (elements[i] === element) {
                continue;
            }
        const targetRect = elements[i].getBoundingClientRect();
            if (
                elementRect.left < targetRect.right &&
                elementRect.right > targetRect.left &&
                elementRect.top < targetRect.bottom &&
                elementRect.bottom > targetRect.top
            ) {
                return elements[i];
            }
        }
    return null;
}


async function getCombinedElement(element1, element2) {
    const sortedElements = [element1, element2].sort();
    const key = sortedElements.join("_");

    if (recipies[key]) {
        return recipies[key];
    }

    try {
        const dataKey = getCookie('dataKey');
        const response = await fetch(`/combine-elements/${dataKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ element1, element2 }),
        });

        const data = await response.json();
        const newElement = data.newElement.replace(/\.$/, '');

        recipies[key] = newElement;
        return newElement;

    } catch (error) {
        console.error('Error fetching combined element:', error);
        throw error;
  }
}


// STORAGE
let challenges = {
}

async function loadChallenges(dataKey) {
    let response = await fetch(`/daily-challenge/`);
    const dailyChallenge = await response.json();
    let element = dailyChallenge.challenge;
    let reward = dailyChallenge.reward;
    const completed = false;

    challenges.DailyChallenge = {element,reward,completed};
    
    const dailyChallengeHolder = document.querySelector(".objective");
    dailyChallengeHolder.querySelector(".objective-text").querySelector(".blue-text").textContent = challenges.DailyChallenge.element;
    dailyChallengeHolder.querySelector(".objective-text").querySelector(".purple-text").textContent = `${challenges.DailyChallenge.reward} Stardust`;

    // Concurrent challenge
    const concurrentHolder = dailyChallengeHolder.cloneNode(true);
    concurrentHolder.querySelector(".objective-objective-title").textContent = "Concurrent Challenge";
    
    response = await fetch(`/concurrent-challenge/${dataKey}`);
    const concurrentChallenge = await response.json();
    element = concurrentChallenge.challenge;
    reward = 10;
    challenges.ConcurrentChallenge = {element,reward,completed};

    concurrentHolder.querySelector(".objective-text").querySelector(".blue-text").textContent = challenges.ConcurrentChallenge.element;
    concurrentHolder.querySelector(".objective-text").querySelector(".purple-text").textContent = `${challenges.ConcurrentChallenge.reward} Stardust`;
    document.querySelector(".objective-holder").appendChild(concurrentHolder);

    // Static challenges
    // Functions
    document.querySelectorAll(".objective-objective-title").forEach((title) => {
        let text = title.parentElement.querySelector(".objective-text")
        title.addEventListener("click",() => {
            if (text.style.display === 'none') {
                text.style.display = 'block';
                text.style.height = 'auto';
            } else {
                text.style.display = 'none';
                text.style.height = '0px';
            }
        });
        text.style.display = 'none';
        text.style.height = '0px';
    });

    checkChallenges();
}

let stardust = 0;
function checkChallenges() {
    console.log(elements);
    Object.keys(challenges).forEach((challenge) => {
        if (elements.includes(challenges[challenge].element) && !challenges[challenge].completed) {
            challenges[challenge].completed = true;
            document.querySelectorAll(".objective").forEach((objective) => {
                if (objective.querySelector(".objective-text").querySelector(".blue-text").textContent === challenges[challenge].element) {
                    objective.querySelector(".objective-objective-title").style.backgroundColor = "#282a2e";
                    objective.querySelector(".objective-objective-title").style.textDecoration = "line-through";
                    objective.querySelector(".objective-text").style.textDecoration = "line-through"
                }
            });
        }
    });
}

// BUTTONS AND WIDGETS
document.querySelector(".recycle-btn").addEventListener("click", () => {
    document.querySelectorAll(".element-container").forEach((element) => {
        if (element.parentElement !== document.querySelector(".scrollable-div")) {
            element.remove();
		}
	});
});
let foldersOn = true;
let isShiftKeyDown = false;
window.addEventListener('keydown', (event) => {
  if (event.key === 'Shift') {
    isShiftKeyDown = true;
      if (currentMouseElement !== null && currentMouseElement.className === "element-container" && currentMouseElement.parentElement === document.querySelector(".scrollable-div")) {
        folderDisplay(currentMouseElement);
      } else if (currentMouseElement !== null && currentMouseElement.className === "element" && currentMouseElement.parentElement.parentElement === document.querySelector(".scrollable-div") || currentMouseElement !== null && currentMouseElement.className === "element-image" && currentMouseElement.parentElement.parentElement === document.querySelector(".scrollable-div")) {
        folderDisplay(currentMouseElement.parentElement);
      }
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key === 'Shift') {
    isShiftKeyDown = false;
      if (!foldersOn) {
      if (currentMouseElement !== null && currentMouseElement.className === "element-container" && currentMouseElement.parentElement === document.querySelector(".scrollable-div")) {
        folderUndisplay(currentMouseElement);
      } else if (currentMouseElement !== null && currentMouseElement.className === "element" && currentMouseElement.parentElement.parentElement === document.querySelector(".scrollable-div") || currentMouseElement !== null && currentMouseElement.className === "element-image" && currentMouseElement.parentElement.parentElement === document.querySelector(".scrollable-div")) {
        folderUndisplay(currentMouseElement.parentElement);
      }
      }
  }
});

document.querySelector(".search-bar").addEventListener("input", (e) => {
    searchText = e.target.value;
    filterElements();
});

let searchText = "";
let folderFocus = "All Elements";
function filterElements() {
    const elements = document.querySelectorAll(".scrollable-div .element-container");
    elements.forEach((element) => {
        let textMatch = true;
        let folderMatch = true;
        
        // Check text match
        if (searchText !== null) {
            textMatch = element.querySelector(".element").textContent.toLowerCase().includes(searchText.toLowerCase());
        }

        // Check folder match
        if (folderFocus !== "All Elements") {
            folderMatch = element.dataset.folder === folderFocus;
        } else {
            folderMatch = element.dataset.folder !== "Deleted Elements";
        }

        // Show or hide the element depending on the matches
        if (textMatch && folderMatch) {
            element.style.display = "flex";
        } else {
            element.style.display = "none";
        }
    });
}

document.querySelector('.reset-btn').addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset your progress?\nThis will only reset your Elements and Folders')) {
        const dataKey = getCookie('dataKey');
        if (dataKey) {
            await resetProgress(dataKey);
            location.reload();
        }
    }
});

async function resetProgress(dataKey) {
    try {
        const response = await fetch('/reset-progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dataKey }),
        });

        if (response.status === 200) {
            location.reload();
        } else {
            console.error(`Error resetting progress. Status code: ${response.status}`);
        }
    } catch (error) {
        console.error('Error resetting progress:', error);
  }
}

function toggleDropdown() {
    const dropdown = document.querySelector('.folders-drop');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}


async function createFolders(dataKey) {
    let AllElements = addFolder("All Elements");    
    AllElements.style.backgroundColor = "#ccc";
    AllElements.style.color = "black";

    addFolder("Deleted Elements");

    // Add folders from save
  try {
    const response = await fetch(`/load-folders/${dataKey}`);
    const data = await response.json();


    if (data.folders) {
      Object.keys(data.folders).forEach((folderName) => {
        addFolder(folderName);
        data.folders[folderName].forEach((elementName) => {
            let AllElements = document.querySelectorAll(".element-container");
            AllElements.forEach((sideElement) => {
                let sideElementName = sideElement.querySelector(".element").textContent
                if (sideElementName === elementName) {
                    sideElement.dataset.folder = folderName;
                }
            });
        });
      });
    }
  } catch (error) {
    console.error('Error loading folders:', error);
  }

    const allElementsFolder = "All Elements";
    const elements = document.querySelectorAll(".scrollable-div .element-container");

    elements.forEach((element) => {
        if (typeof element.dataset.folder === 'undefined') {
            element.dataset.folder = allElementsFolder;
        }
    });
}

function addFolder(name) {
    if (folderExists(name)) {return;}
    let folder = document.createElement("div");
    folder.className = "folder";
    folder.textContent = name;
    document.body.querySelector(".folder-tab").appendChild(folder)

    folder.addEventListener('click', function (event) {
        resetFolderColors(); 
        this.style.backgroundColor = "#ccc";
        this.style.color = "black";
        folderFocus = this.textContent;
        filterElements();
    });
    return folder;
}

function removeFolder(name) {
    const folders = document.querySelectorAll(".folder");
    for (const folder of folders) {
        if (folder.textContent === name && folder.textContent !== "All Elements" && folder.textContent !== "Deleted Elements") {
            folder.remove();
            break;
        }
    }
}

function resetFolderColors() {
    let folders = document.querySelectorAll(".folder");
    folders.forEach((folder) => {
        folder.style.backgroundColor = "#373b41";
        folder.style.color = "#1c1c1e";
    });
}

document.querySelector(".folder-tab").style.display = "none";
document.querySelector(".folder-title").textContent = "Folders \u2191";

document.querySelector(".folder-title").addEventListener('click', function (event){
    if (document.querySelector(".folder-tab").style.display === "none") {
        document.querySelector(".folder-tab").style.display = "block";
        document.querySelector(".folder-title").textContent = "Folders \u2193";
        document.querySelector(".rm-folder").style.display = "block";
        document.querySelector(".add-folder").style.display = "block";
        document.querySelector(".folder-bar").style.display = "block";
    } else {
        document.querySelector(".folder-tab").style.display = "none";
        document.querySelector(".folder-title").textContent = "Folders \u2191";
        document.querySelector(".rm-folder").style.display = "none";
        document.querySelector(".add-folder").style.display = "none";
        document.querySelector(".folder-bar").style.display = "none";

    }
});


document.querySelector(".add-folder").addEventListener('click', function (event) {
    let name = document.querySelector(".folder-bar").value;
    if (name && !folderExists(name)) {
        addFolder(name);
    }
        const dataKey = getCookie('dataKey');
        if (dataKey) {
            saveFolders(dataKey);
        }
});

document.querySelector(".rm-folder").addEventListener('click', function (event) {
    let name = document.querySelector(".folder-bar").value;
    if (name && folderExists(name)) {
        removeFolder(name);
    }
        const dataKey = getCookie('dataKey');
        if (dataKey) {
            saveFolders(dataKey);
        }
});

function folderExists(name) {
    const folders = document.querySelectorAll(".folder");
    for (const folder of folders) {
        if (folder.textContent === name) {
            return true;
        }
    }
    return false;
}
//COOKIES AND MIDDLEND

function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 86400000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim().split('=');
        if (cookie[0] === name) {
            return cookie[1];
        }
    }
  return null;
}

document.addEventListener('DOMContentLoaded', async () => {
    let dataKey = getCookie('dataKey');
    if (!dataKey) {
        dataKey = generateDataKey();
        setCookie('dataKey', dataKey, 365);
    }
    await loadSavedElements(dataKey);
    createFolders(dataKey);
    loadChallenges(dataKey);
});


function generateDataKey() {
    const length = 20;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}


async function loadSavedElements(dataKey) {
    try {
        const response = await fetch(`/load-elements/${dataKey}`);
        const data = await response.json();

        if (data.elements) {
            data.elements.forEach((element) => {
                if (!isElementInSidebar(element)) {
                    addToSidebar(element);
                }
            });
        }
    } catch (error) {
        console.error('Error loading saved elements:', error);
    }
    queryElements();
}

async function saveFolders(dataKey) {
  const folderElements = Array.from(document.querySelectorAll('.folder-tab .folder'));
  const folders = folderElements.reduce((result, folderElement) => {
    const folderName = folderElement.textContent;
    if (folderName !== 'All Elements') {
      result[folderName] = [];
    }
    return result;
  }, {});

  const elements = Array.from(document.querySelectorAll('.scrollable-div .element-container'));
  elements.forEach((element) => {
    const folderName = element.dataset.folder;
    if (folders.hasOwnProperty(folderName)) {
      folders[folderName].push(element.querySelector('.element').textContent);
    }
  });

  try {
    await fetch('/save-folders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dataKey, folders }),
    });
  } catch (error) {
    console.error('Error saving folders:', error);
  }
}
