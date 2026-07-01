import api from "./api";

class NewsletterService {
  /**
   * Subscribe to newsletter
   */
  async subscribe(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post("/newsletter/subscribe", { email });
      return {
        success: true,
        message: response.data.message || "Subscribed successfully",
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Subscription failed";
      throw new Error(errorMessage);
    }
  }

  /**
   * Unsubscribe from newsletter
   */
  async unsubscribe(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post("/newsletter/unsubscribe", { email });
      return {
        success: true,
        message: response.data.message || "Unsubscribed successfully",
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Unsubscribe failed";
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all newsletter subscribers (admin only)
   */
  async getSubscribers(): Promise<any[]> {
    try {
      const response = await api.get("/newsletter/subscribers");
      return response.data.data.subscribers || [];
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch subscribers";
      throw new Error(errorMessage);
    }
  }
}

export default new NewsletterService();
