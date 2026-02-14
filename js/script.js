function startTest(type) {
    // Save selected test type in localStorage
    localStorage.setItem("testType", type);

    // For now just show alert
    alert("You selected: " + type);

    // Later we redirect to test page
    // Example:
    // window.location.href = "test.html";
}
