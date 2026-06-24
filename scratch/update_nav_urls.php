<?php
$db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
$db->exec("UPDATE navigation_menu SET url = '/cruzaa-scoota' WHERE title LIKE '%Limited Edition%'");
$db->exec("UPDATE navigation_menu SET url = '/e-scooters' WHERE title LIKE 'E Scooters%'");
$db->exec("UPDATE navigation_menu SET url = '/e-byke' WHERE title LIKE 'E-Bikes%'");
echo "Updated navigation URLs.\n";
