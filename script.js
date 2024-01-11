$(document).ready(function() {
    
    // DELETE: Remove tasks
    $(document).on('click', '.delete, .delete-work', function() {
        const itemToDelete = $(this).siblings("p").text().trim(); // trim to remove any white spaces
        let actionPath;

        // Determine the correct endpoint based on the current path
        if (window.location.pathname.includes("/work")) {
            actionPath = "/work/delete";
        } else {
            actionPath = "/delete";
        }

        // AJAX request to delete the task
        $.ajax({
            url: actionPath,
            type: 'DELETE',
            data: { itemToDelete: itemToDelete },
            success: function(response) {
                location.reload();  // Reload the page to reflect the deletion
            },
            error: function(xhr, textStatus, errorThrown) {
                console.error("Error:", errorThrown);  // Log the error to console for debugging
                alert("An error occurred while trying to delete the item. Please try again.");
            }
        });
    });
});



    // NAVIGATION: Change navbar color upon scrolling
    $(window).scroll(function(){
        var scroll = $(window).scrollTop();
        if (scroll > 50) {
            $(".main-header").css("background", "#aa98db");
        } else {
            $(".main-header").css("background", "#D0BFFF");
        }
    });

    // SCROLLING: Scroll position handling for new items
    $("form.item").on('submit', function(e) {
        e.preventDefault();
        $.post($(this).attr("action"), $(this).serialize(), function(response) {
            location.reload();
            let lastItem = $(".item").last();
            $('html, body').scrollTop(lastItem.offset().top);
        });
    });

    // ADDING NEW TASKS: Logic for adding new tasks and new work tasks
    $("#addItemButton").click(function() {
        let newTask = $("#newItem").val();
        if(newTask.trim() !== "") {
            $.post("/submit", { newItem: newTask }, function() {
                location.reload();
            }).fail(function() {
                alert("Error submitting task.");
            });
            $("#newItem").val("");
        } else {
            alert("Please enter a valid task.");
        }
    });

    $("#addWorkItemButton").click(function() {
        let newWorkTask = $("#newWorkItem").val();
        if(newWorkTask.trim() !== "") {
            $.post("/work/submit", { newItem: newWorkTask }, function() {
                location.reload();
            }).fail(function() {
                alert("Error submitting work task.");
            });
            $("#newWorkItem").val("");
        } else {
            alert("Please enter a valid work task.");
        }
    });

    // COMPLETION TOGGLE: Newly added - Logic for updating task completion based on checkbox
    $("input[type='checkbox']").change(function() {
        const isCompleted = $(this).prop('checked'); // New: Get checkbox status
        const taskDescription = $(this).siblings('p').text();
        const actionPath = window.location.pathname === "/work" ? "/work/toggle-completion" : "/toggle-completion";

        $.post(actionPath, { description: taskDescription, completed: isCompleted }, function(response) {
            // Placeholder for any success handling, currently does nothing
        }).fail(function() {
            alert("Error updating task completion status.");
        });
    });

