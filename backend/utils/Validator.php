<?php
/**
 * Validation Utility
 */
class Validator
{

    private $errors = [];
    private $data = [];

    public function __construct($data)
    {
        $this->data = $data;
    }

    /**
     * Validate required fields
     */
    public function required($field, $message = null)
    {
        $value = $this->data[$field] ?? null;
        $isEmpty = false;

        if ($value === null) {
            $isEmpty = true;
        } elseif (is_string($value)) {
            $isEmpty = trim($value) === '';
        } elseif (is_array($value)) {
            $isEmpty = empty($value);
        }

        if ($isEmpty) {
            $this->errors[$field] = $message ?? ucfirst($field) . ' is required';
        }
        return $this;
    }

    /**
     * Validate email
     */
    public function email($field, $message = null)
    {
        $value = $this->data[$field] ?? null;
        if ($value !== null && is_string($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = $message ?? 'Invalid email format';
        } elseif ($value !== null && !is_string($value)) {
            $this->errors[$field] = $message ?? 'Invalid email format';
        }
        return $this;
    }

    /**
     * Validate minimum length
     */
    public function min($field, $length, $message = null)
    {
        $value = $this->data[$field] ?? null;
        if ($value !== null && is_string($value) && strlen($value) < $length) {
            $this->errors[$field] = $message ?? ucfirst($field) . " must be at least {$length} characters";
        } elseif ($value !== null && is_array($value) && count($value) < $length) {
            $this->errors[$field] = $message ?? ucfirst($field) . " must have at least {$length} items";
        }
        return $this;
    }

    /**
     * Validate maximum length
     */
    public function max($field, $length, $message = null)
    {
        $value = $this->data[$field] ?? null;
        if ($value !== null && is_string($value) && strlen($value) > $length) {
            $this->errors[$field] = $message ?? ucfirst($field) . " must not exceed {$length} characters";
        } elseif ($value !== null && is_array($value) && count($value) > $length) {
            $this->errors[$field] = $message ?? ucfirst($field) . " must not exceed {$length} items";
        }
        return $this;
    }

    /**
     * Validate numeric
     */
    public function numeric($field, $message = null)
    {
        $value = $this->data[$field] ?? null;
        if ($value !== null && !is_numeric($value)) {
            $this->errors[$field] = $message ?? ucfirst($field) . ' must be numeric';
        }
        return $this;
    }

    /**
     * Validate unique (database check)
     */
    public function unique($field, $table, $column, $exceptId = null, $message = null)
    {
        if (!isset($this->data[$field])) {
            return $this;
        }

        $db = (new Database())->getConnection();
        $sql = "SELECT COUNT(*) as count FROM {$table} WHERE {$column} = :value";

        if ($exceptId) {
            $sql .= " AND id != :exceptId";
        }

        $stmt = $db->prepare($sql);
        $stmt->bindParam(':value', $this->data[$field]);

        if ($exceptId) {
            $stmt->bindParam(':exceptId', $exceptId);
        }

        $stmt->execute();
        $result = $stmt->fetch();

        if ($result['count'] > 0) {
            $this->errors[$field] = $message ?? ucfirst($field) . ' already exists';
        }

        return $this;
    }

    /**
     * Check if validation passed
     */
    public function passes()
    {
        return empty($this->errors);
    }

    /**
     * Check if validation failed
     */
    public function fails()
    {
        return !$this->passes();
    }

    /**
     * Get validation errors
     */
    public function errors()
    {
        return $this->errors;
    }

    /**
     * Get validated data
     */
    public function validated()
    {
        return $this->data;
    }
}
