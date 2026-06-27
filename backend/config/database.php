<?php

/**
 * Database Configuration
 */
class Database
{
    private $host = "localhost";
    private $db_name = "cruzaa_admin";
    private $username = "root";
    private $password = "";
    public $conn;
    // private $host = "mysql-200-138.mysql.prositehosting.net";
    // private $db_name = "cruzaa_admin";
    // private $username = "cruzaa_urser";
    // private $password = "cruz@a_db123";
    // public $conn;

    /**
     * Get database connection
     */
    public function getConnection()
    {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            // Throwing exception so it can be caught in index.php or controller
            throw new Exception("Database Connection Error: " . $e->getMessage());
        }

        return $this->conn;
    }
}
