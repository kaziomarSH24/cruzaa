<?php
/**
 * Hero Slider Controller - Structured Slide Management
 */
class HeroSliderController
{
    private $db;

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
    }

    /**
     * Get all slides (Public & Admin)
     */
    public function index()
    {
        $isAdmin = isset($_GET['admin']) && $_GET['admin'] === 'true';
        $where = $isAdmin ? "1=1" : "is_active = 1";

        try {
            $stmt = $this->db->prepare("SELECT * FROM hero_sliders WHERE {$where} ORDER BY sort_order ASC");
            $stmt->execute();
            $slides = $stmt->fetchAll();

            // Fix image paths
            foreach ($slides as &$slide) {
                if (!empty($slide['image'])) {
                    if (!filter_var($slide['image'], FILTER_VALIDATE_URL)) {
                        $slide['image'] = FileUpload::getUrl($slide['image']);
                    }
                }
                // video_url is stored as-is (YouTube URL), no transformation needed
            }

            Response::success($slides);
        } catch (Throwable $e) {
            Response::serverError('Failed to fetch slides: ' . $e->getMessage());
        }
    }

    /**
     * Create or update slides (Bulk Update)
     */
    public function updateAll()
    {
        AuthMiddleware::authenticate();
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        if (!is_array($data)) {
            Response::error('Invalid data format. Expected an array of slides.', 400);
        }

        try {
            $this->db->beginTransaction();

            // 1. Get existing IDs to manage deletions
            $stmt = $this->db->query("SELECT id FROM hero_sliders");
            $existingIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
            $existingIds = array_map('strval', $existingIds);

            $newIds = [];
            foreach ($data as $slide) {
                if (isset($slide['id']) && $slide['id'] !== null && $slide['id'] !== '') {
                    $newIds[] = strval($slide['id']);
                }
            }

            // 2. Delete slides not present in the input
            $idsToDelete = array_diff($existingIds, $newIds);
            if (!empty($idsToDelete)) {
                $placeholders = implode(',', array_fill(0, count($idsToDelete), '?'));
                $stmt = $this->db->prepare("DELETE FROM hero_sliders WHERE id IN ($placeholders)");
                $stmt->execute(array_values($idsToDelete));
            }

            // 3. Update or Insert each slide
            foreach ($data as $index => $slide) {
                $id = isset($slide['id']) ? strval($slide['id']) : null;
                $isUpdate = ($id !== null && in_array($id, $existingIds));

                if ($isUpdate) {
                    $stmt = $this->db->prepare("
                        UPDATE hero_sliders SET 
                            title = :title, 
                            subtitle = :subtitle, 
                            description = :description, 
                            image = :image,
                            video_url = :video_url,
                            cta_text = :cta_text, 
                            cta_link = :cta_link, 
                            badge = :badge, 
                            sort_order = :sort_order, 
                            is_active = :is_active
                        WHERE id = :id
                    ");
                    $stmt->bindValue(':id', $id);
                } else {
                    $stmt = $this->db->prepare("
                        INSERT INTO hero_sliders (
                            title, subtitle, description, image, video_url, cta_text, cta_link, badge, sort_order, is_active
                        ) VALUES (
                            :title, :subtitle, :description, :image, :video_url, :cta_text, :cta_link, :badge, :sort_order, :is_active
                        )
                    ");
                }

                $stmt->bindValue(':title', $slide['title'] ?? '');
                $stmt->bindValue(':subtitle', $slide['subtitle'] ?? '');
                $stmt->bindValue(':description', $slide['description'] ?? '');

                // Normalize image path (store only the relative path in DB)
                $image = $slide['image'] ?? '';
                $search = '/uploads/';
                $pos = strpos($image, $search);
                if ($pos !== false) {
                    $image = substr($image, $pos + strlen($search));
                }

                $stmt->bindValue(':image', $image);
                $stmt->bindValue(':video_url', $slide['video_url'] ?? '');
                $stmt->bindValue(':cta_text', $slide['cta_text'] ?? $slide['ctaText'] ?? '');
                $stmt->bindValue(':cta_link', $slide['cta_link'] ?? $slide['ctaLink'] ?? '');
                $stmt->bindValue(':badge', $slide['badge'] ?? '');
                $stmt->bindValue(':sort_order', $index, PDO::PARAM_INT);
                $stmt->bindValue(':is_active', (int) ($slide['is_active'] ?? 1), PDO::PARAM_INT);

                $stmt->execute();
            }

            // 4. Also keep dynamic_content table updated for any partial frontends (Backwards compatibility)
            $stmt = $this->db->prepare("
                INSERT INTO dynamic_content (content_key, content_type, content_value, content_group, description, is_active)
                VALUES ('homepage_slider', 'json', :value, 'homepage', 'Main Homepage Hero Slider Data', 1)
                ON DUPLICATE KEY UPDATE content_value = VALUES(content_value)
            ");
            $stmt->bindValue(':value', json_encode($data));
            $stmt->execute();

            $this->db->commit();
            Response::success(null, 'Hero slider updated successfully');

        } catch (Throwable $e) {
            if ($this->db->inTransaction())
                $this->db->rollBack();
            Response::serverError('Failed to update hero slider: ' . $e->getMessage());
        }
    }

    /**
     * Delete a single slide
     */
    public function delete($id)
    {
        AuthMiddleware::authenticate();
        try {
            $stmt = $this->db->prepare("DELETE FROM hero_sliders WHERE id = :id");
            $stmt->bindValue(':id', $id);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                Response::success(null, 'Slide deleted successfully');
            } else {
                Response::notFound('Slide not found');
            }
        } catch (Throwable $e) {
            Response::serverError('Failed to delete slide: ' . $e->getMessage());
        }
    }
}
