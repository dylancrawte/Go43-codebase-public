interface ApiResponse<T> {
    success: boolean;
    data: T;
    error: string | null;
}

export class HttpClient {
    constructor(private baseUrl: string) {}

    async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        return {
            success: response.ok,
            data: result,
            error: response.ok ? null : result.error
        };
    }
}