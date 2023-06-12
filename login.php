<?php
// Start session
session_start();

// Connect to the SQLite database
$DBSTRING = "sqlite:cse383.db";
include "sql.inc";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

	// Step 3 (Process logout POST variable and set session)
    if (isset($_POST['logout']) && $_POST['logout'] == '1') {
		$_SESSION['loggedin'] = false;
		unset($_SESSION['username']);
	}

	// Step 1
	// Get the username and pasword from the $_POST variables
    $username = $_POST['username'];
    $password = $_POST['password'];

	// Prepare and execute the SQL query to validate the login credentials
	try {
		$DATA=GET_SQL("select * from auth where username=? and password=?", $username, $password);
		// Set session variable
		if (count($DATA) > 0) {
			// user and password worked - set session variables
            $_SESSION['loggedin'] = true;
            $_SESSION['username'] = $username;
		}
		else {
			// No data retrieved - username/password not found
			// Set session variable to not logged in
            $_SESSION['loggedin'] = false;
		}
	}
	catch  (Exception $e) {
		// Database Error
		// Set session variable to not logged in
        $_SESSION['loggedin'] = false;
	}

}
Print "
<!DOCTYPE html>
<html lang='en'>
<head>
<meta charset='UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1.0'>
<title>Login</title>
</head>
<body>";
if (!isset($_SESSION['loggedin']) || !$_SESSION['loggedin']) {
    //  Write the login form here  (2.a.i)
    print ("
        <div style=\"text-align: left;\">
            <h1>Login</h1>
            <form method='post' action=''>
                <label for='username'>Username:</label>
                <input type='text' name='username' id='username'>
                <br>
                <br>
                <label for='password'>Password:</label>
                <input type='password' name='password' id='password'>
                <br>
                <br>
                <input type='submit' value='Login'>
            </form>
        </div>
	");
}
else {
    //  Write the logged in secure data here (add a log out function) (2.b.i)
    print ("
    <div style=\"text-align: left;\">
        <h1>Success!</h1>
        <p>You have sucessfully logged into the form.</p>
        <form method='post' action=''>
            <input type='hidden' name='logout' value='1'>
            <input type='submit' value='Logout'>
        </form>
    </div>
");
}
?>
</body>
</html>
