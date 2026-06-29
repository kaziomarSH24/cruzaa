<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';

function sendSmtpEmail($db, $to, $subject, $message) {
    try {
        
        $stmt = $db->prepare("SELECT setting_key, setting_value FROM settings WHERE setting_type = 'smtp' OR setting_key = 'site_name'");
        $stmt->execute();
        $settings = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }

        if (empty($settings['smtp_enabled']) || $settings['smtp_enabled'] == '0') {
            throw new Exception("SMTP is disabled in settings.");
        }

        $mail = new PHPMailer(true);

        $mail->isSMTP();
        $mail->Host       = $settings['smtp_host'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $settings['smtp_username'];
        $mail->Password   = $settings['smtp_password'];
        $mail->SMTPSecure = $settings['smtp_encryption']; // 'tls'
        $mail->Port       = $settings['smtp_port'];       // 587

        
        $siteName = $settings['site_name'] ?? 'Cruzaa E-Commerce';
        $mail->setFrom($settings['smtp_username'], $siteName);
        $mail->addAddress($to);

    
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = nl2br($message); 
        $mail->AltBody = strip_tags($message); 

        $mail->send();
        return true;

    } catch (Exception $e) {
        error_log("Mail Error: " . $e->getMessage());
        return false;
    }
}