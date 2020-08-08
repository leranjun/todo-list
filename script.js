// FINDME: Define selectors
const bodyTag = $("body");
const inputBoxes = $("input[type='text']");
const windowWrapper = $("#window");
const newContent = $("#new-content");
const addButton = $("#add-content");
const clearButton = $("#remove-all");
const emptyNotice = $("#todo-list-empty");
const todoList = $("#todo-list");
const todoListBody = $("#todo-list tbody");
let todoListRows = "";
$(function() {
    todoListRows = $("#todo-list tbody tr").not(".border");
});

// FINDME: Test webp
// https://developers.google.com/speed/webp/faq#how_can_i_detect_browser_support_for_webp
function check_webp_feature(feature, callback) {
    const kTestImages = {
        lossy: "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
        lossless: "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
        alpha: "UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==",
        animation: "UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"
    };
    const img = new Image();
    img.onload = function () {
        const result = (img.width > 0) && (img.height > 0);
        callback(result);
    };
    img.onerror = function () {
        callback(false);
    };
    img.src = "data:image/webp;base64," + kTestImages[feature];
}

$(function() {
    check_webp_feature("lossy", function(result) {
        if (result) {
            $("#pin-left").css("background-image", "url('assets/pin-left.webp')");
            $("#pin-right").css("background-image", "url('assets/pin-right.webp')");
        }
    });
});

// FINDME: Add new row function
function addNewRow(item) {
    let itemHTML = `
    <tr>
        <td>
            <input type="checkbox" class="done" />
        </td>
        <td>` +
        item +
        `</td>
        <td>
            <button class="remove">Remove</button>
        </td>
    </tr><tr class="border"><td colspan="3" class="tbody border"></td></tr>`;
    // Use trim() to remove extra white spaces
    itemHTML = itemHTML.trim();
    todoListBody.append(itemHTML);
    todoListRows = $("#todo-list tbody tr").not(".border");
}

// FINDME: Hide list
todoList.hide();
clearButton.hide();

// FINDME: Random background
const backgrounds = [
    "seashell", // Red
    "mistyrose", // Orange
    "lightyellow", // Yellow
    "honeydew", // Green
    "lightcyan", // Indigo
    "azure", // Blue
    "lavenderblush" // Purple
];
let randomNum = Math.floor(Math.random() * backgrounds.length);
const bodyBackground = backgrounds[randomNum];
bodyTag.css("background", bodyBackground);
let randomNum2 = Math.floor(Math.random() * backgrounds.length);
while (randomNum2 === randomNum) {
    randomNum2 = Math.floor(Math.random() * backgrounds.length);
}
const windowBackground = backgrounds[randomNum2];
windowWrapper.css("background", windowBackground);
inputBoxes.css("background", windowBackground);
inputBoxes.on("focus", function() {
    const thisBox = $(this);
    thisBox.css("outline", "none");
    thisBox.css("background", "white");
});
inputBoxes.on("blur", function() {
    const thisBox = $(this);
    thisBox.css("background", windowBackground);
});

// FINDME: Random placeholders
const placeholders = [
    "Meet with friends 👋",
    "Read books 📚",
    "Play video games 🎮",
    "Watch a movie 🍿",
    "Go shopping 🛍️"
];
randomNum = Math.floor(Math.random() * placeholders.length);
newContent.attr("placeholder", placeholders[randomNum]);

// FINDME: Read from Cookies
let todo = [];
let saved = Cookies.get("todo");
if (saved && saved !== "[]") {
    saved = JSON.parse(saved);
    $.each(saved, function(index, value) {
        todo.push(value);
        addNewRow(value[0]);

        const thisRow = todoListBody.children().not(".border").eq(index);
        const thisItem = thisRow.children().eq(1);
        const thisCheckbox = thisRow.children().eq(0).children();

        if (value[1]) {
            // Checked, put a line through
            thisItem.css("text-decoration", "line-through");
        } else {
            // Unchecked, remove line
            thisItem.css("text-decoration", "initial");
        }

        thisCheckbox.prop("checked", value[1]);
    });
    emptyNotice.hide();
    todoList.show();
    clearButton.show();
}

// FINDME: Add button
// When addButton is clicked
addButton.on("click", function() {
    // Step 1: Hide emptyNotice and show todoList
    emptyNotice.hide();
    todoList.show();
    clearButton.show();

    // Step 2: Get what the new content is
    let item = newContent.val();
    if (!item) {
        item = newContent.attr("placeholder");
    }

    // Step 3: Insert a new row
    addNewRow(item);
    todo.push([item, false]);
    Cookies.set("todo", JSON.stringify(todo));

    // Step 4: Clear input box
    newContent.val("");
});

// FINDME: Clear button
clearButton.on("click", function() {
    todoListBody.empty();
    todo = [];
    Cookies.remove("todo");

    todoList.hide();
    clearButton.hide();
    emptyNotice.show();
});

// FINDME: Remove button
$(document).on("click", ".remove", function() {
    // Remove the closest table row (i.e. this item)
    const thisButton = $(this);
    const thisItem = thisButton.closest("tr");
    const thisItemBorder = thisItem.next("tr");
    thisItem.remove();
    thisItemBorder.remove();

    const thisItemIndex = todoListRows.index(thisItem);
    todo.splice(thisItemIndex, 1);
    Cookies.set("todo", JSON.stringify(todo));

    // Check if table is empty (i.e. if length is 0)
    // Use trim() to remove extra white spaces
    const todoListText = todoListBody.text().trim();
    if (todoListText.length === 0) {
        todoList.hide();
        clearButton.hide();
        emptyNotice.show();
    }
});

// FINDME: Mark as done
$(document).on("click", ".done", function() {
    const thisCheckbox = $(this);
    // Is this checked?
    const isThisChecked = thisCheckbox.prop("checked");
    // Find this item
    const thisItem = thisCheckbox.closest("td").next("td");
    const thisRow = thisItem.parent();

    const thisItemIndex = todoListRows.index(thisRow);
    if (isThisChecked) {
        // Checked, put a line through
        thisItem.css("text-decoration", "line-through");
        todo[thisItemIndex][1] = true;
    } else {
        // Unchecked, remove line
        thisItem.css("text-decoration", "initial");
        todo[thisItemIndex][1] = false;
    }

    Cookies.set("todo", JSON.stringify(todo));
});

bodyTag.removeClass("loading");