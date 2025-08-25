// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5035/api';

// Debug: Log the API base URL
console.log('🔧 API Base URL:', API_BASE_URL);
console.log('🔧 Environment Variable:', import.meta.env.VITE_API_BASE_URL);

// Helper: Fix image URLs to use LocalTunnel instead of localhost
function fixImageUrl(imageUrl) {
    if (!imageUrl) return imageUrl;
    
    // Get current tunnel URL
    const tunnelUrl = API_BASE_URL.replace('/api', '');
    
    // Replace localhost:5035 with current LocalTunnel URL
    if (imageUrl.includes('localhost:5035')) {
        const fixedUrl = imageUrl.replace('http://localhost:5035', tunnelUrl);
        console.log('🔧 Fixed localhost image URL:', { original: imageUrl, fixed: fixedUrl });
        return fixedUrl;
    }
    
    // If it's already a LocalTunnel URL but wrong subdomain, fix it
    if (imageUrl.includes('loca.lt')) {
        const path = imageUrl.split('/uploads/')[1];
        if (path) {
            const fixedUrl = `${tunnelUrl}/uploads/${path}`;
            console.log('🔧 Fixed LocalTunnel image URL:', { original: imageUrl, fixed: fixedUrl });
            return fixedUrl;
        }
    }
    
    // If it's a relative path, make it absolute
    if (imageUrl.startsWith('/uploads/')) {
        const fixedUrl = `${tunnelUrl}${imageUrl}`;
        console.log('🔧 Fixed relative image URL:', { original: imageUrl, fixed: fixedUrl });
        return fixedUrl;
    }
    
    return imageUrl;
}

// Helper: deep-convert object keys from PascalCase to camelCase
function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function camelizeKey(key) {
  if (typeof key !== 'string' || key.length === 0) return key;
  // Only change keys that start with an uppercase ASCII letter
  return /^[A-Z]/.test(key) ? key.charAt(0).toLowerCase() + key.slice(1) : key;
}

function deepCamelize(value) {
  if (Array.isArray(value)) {
    return value.map((item) => deepCamelize(item));
  }
  if (isPlainObject(value)) {
    const result = {};
    for (const [key, val] of Object.entries(value)) {
      const newKey = camelizeKey(key);
      result[newKey] = deepCamelize(val);
    }
    return result;
  }
  return value;
}


function convertKeysToCamelCase(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(convertKeysToCamelCase);
    
    const camelCaseObj = {};
    for (const [key, value] of Object.entries(obj)) {
        const camelKey = key.replace(/([-_][a-z])/g, (group) =>
            group.replace('-', '').replace('_', '').toUpperCase()
        );
        
        // Fix image URLs for specific fields
        if ((key === 'coverImageUrl' || key === 'imageUrl') && typeof value === 'string') {
            camelCaseObj[camelKey] = fixImageUrl(value);
        } else {
            camelCaseObj[camelKey] = convertKeysToCamelCase(value);
        }
    }
    return camelCaseObj;
}

// Enhanced API call function with ngrok bypass headers and retry mechanism
async function apiCall(endpoint, options = {}) {
    // Ensure the endpoint starts with / and the base URL ends with /api
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
    const url = `${baseUrl}${cleanEndpoint}`;
    
    // Add headers to bypass ngrok warning page - comprehensive approach
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Skip ngrok warning page
        'ngrok-skip-browser-warning': '1', // Alternative format
        'bypass-tunnel-reminder': 'true', // Skip LocalTunnel warning page
        'User-Agent': 'RoyalLibrary/1.0', // Custom user agent
        'X-Requested-With': 'XMLHttpRequest', // AJAX request
        'Cache-Control': 'no-cache', // No cache
        'Pragma': 'no-cache', // No cache
        'Referer': 'https://royal-library.vercel.app', // Set referer
        'Origin': 'https://royal-library.vercel.app', // Set origin
        ...options.headers
    };

    const config = {
        method: options.method || 'GET',
        headers,
        mode: 'cors', // Explicit CORS mode
        credentials: 'omit', // Don't send cookies
        ...options
    };

    if (options.body) {
        config.body = JSON.stringify(options.body);
    }

    console.log('Making API call to:', url);
    console.log('Options:', config);

    // Retry mechanism for ngrok warning pages
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, config);
            console.log(`Attempt ${attempt} - Response status:`, response.status);
            console.log(`Attempt ${attempt} - Response headers:`, Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            const text = await response.text(); // Read body as text once
            console.log(`Attempt ${attempt} - Raw response text:`, text.substring(0, 500)); // Log first 500 chars

            try {
                const data = JSON.parse(text);
                console.log(`Attempt ${attempt} - API call successful, JSON result:`, data);
                return convertKeysToCamelCase(data);
            } catch (jsonError) {
                // If JSON parsing fails, check for tunnel warning pages
                if (text.includes('<!DOCTYPE html>') || text.includes('ngrok') || text.includes('localtunnel')) {
                    console.log(`Attempt ${attempt} - tunnel warning page detected`);
                    if (attempt < maxRetries) {
                        console.log(`Waiting 2 seconds before retry ${attempt + 1}...`);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        continue;
                    } else {
                        throw new Error('tunnel warning page detected after all retries - please visit the API directly first');
                    }
                } else {
                    // If not a tunnel warning, and not JSON, it's an unexpected response
                    throw new Error('Expected JSON response but got non-JSON: ' + text.substring(0, 200));
                }
            }
        } catch (error) {
            console.log(`Attempt ${attempt} - API call error:`, error);
            lastError = error;
            
            if (attempt < maxRetries) {
                console.log(`Waiting 2 seconds before retry ${attempt + 1}...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    throw lastError;
}

// Helper: Test if image URL is accessible
async function testImageUrl(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.log('🔧 Image URL test failed:', url, error);
        return false;
    }
}

// Helper: Get best available image URL
async function getBestImageUrl(book) {
    const tunnelUrl = API_BASE_URL.replace('/api', '');
    
    // Try coverImageUrl first
    if (book.coverImageUrl) {
        const fixedUrl = fixImageUrl(book.coverImageUrl);
        if (await testImageUrl(fixedUrl)) {
            return fixedUrl;
        }
    }
    
    // Try images array
    if (book.images && book.images.length > 0) {
        for (const image of book.images) {
            const fixedUrl = fixImageUrl(image.imageUrl);
            if (await testImageUrl(fixedUrl)) {
                return fixedUrl;
            }
        }
    }
    
    // If no images work, return placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YwZjBmMCIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Zhtin2YbYqDwvdGV4dD4KPC9zdmc+';
}

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Helper method to get auth headers for file uploads
  getAuthHeadersForUpload() {
    const token = localStorage.getItem('token');
    return {
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Upload image method
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseURL}/Books/upload-image`, {
        method: 'POST',
        headers: this.getAuthHeadersForUpload(),
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Upload failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  // Generic API call method
  async apiCall(endpoint, options = {}) {
    try {
      console.log(`Making API call to: ${this.baseURL}${endpoint}`)
      console.log('Options:', options)
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: this.getAuthHeaders(),
        ...options
      });

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        let errorMessage = `API call failed: ${response.status} ${response.statusText}`
        
        try {
          const errorData = await response.json()
          console.error('Error response data:', errorData)
          errorMessage += `\nDetails: ${JSON.stringify(errorData)}`
        } catch (parseError) {
          console.error('Could not parse error response as JSON')
          const errorText = await response.text()
          errorMessage += `\nResponse text: ${errorText}`
        }
        
        const error = new Error(errorMessage)
        error.response = response
        throw error
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const rawResult = await response.json()
        const result = deepCamelize(rawResult)
        console.log('API call successful, result:', result)
        return result
      }
      
      const result = await response.text()
      console.log('API call successful, text result:', result)
      return result
    } catch (error) {
      console.error('API call error:', error)
      throw error
    }
  }

  // Authentication Methods
  async login(email, password) {
    const response = await this.apiCall('/Auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Debug: Log what we're saving
      console.log('Login - saving user to localStorage:', response.user);
      console.log('Login - user role:', response.user?.role);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.apiCall('/Auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    const parsedUser = user ? JSON.parse(user) : null;
    console.log('getCurrentUser() - raw user from localStorage:', user);
    console.log('getCurrentUser() - parsed user:', parsedUser);
    console.log('getCurrentUser() - user role:', parsedUser?.role);
    return parsedUser;
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  isAdmin() {
    const user = this.getCurrentUser();
    console.log('isAdmin() - user:', user);
    console.log('isAdmin() - user role:', user?.role);
    const isAdmin = user && (user.role === 'Admin' || user.role === 'Librarian');
    console.log('isAdmin() - result:', isAdmin);
    return isAdmin;
  }

  // Book Methods
  async getBooks(page = 1, pageSize = 12, searchTerm = '', categoryId = null, authorId = null) {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(searchTerm && { searchTerm }),
      ...(categoryId && { categoryId: categoryId.toString() }),
      ...(authorId && { authorId: authorId.toString() })
    });

    return await this.apiCall(`/Books?${params}`);
  }

  async getBook(id) {
    return await this.apiCall(`/Books/${id}`);
  }

  async getFeaturedBooks() {
    return await this.apiCall('/Books/featured');
  }

  async getNewReleases() {
    return await this.apiCall('/Books/new-releases');
  }

  async getBooksByCategory(categoryId) {
    return await this.apiCall(`/Books/category/${categoryId}`);
  }

  async getBooksByAuthor(authorId) {
    return await this.apiCall(`/Books/author/${authorId}`);
  }

  // Category Methods
  async getCategories() {
    return await this.apiCall('/Categories/active');
  }

  async getCategory(id) {
    return await this.apiCall(`/Categories/${id}`);
  }

  // Author Methods
  async getAuthors() {
    return await this.apiCall('/Authors');
  }

  async getAuthor(id) {
    return await this.apiCall(`/Authors/${id}`);
  }

  // Publisher Methods
  async getPublishers() {
    return await this.apiCall('/Publishers');
  }

  async getPublisher(id) {
    return await this.apiCall(`/Publishers/${id}`);
  }

  // Dashboard Methods
  async getDashboardStats() {
    return await this.apiCall('/Dashboard/stats');
  }

  // Admin Methods - Books
  async createBook(bookData) {
    return await this.apiCall('/Books', {
      method: 'POST',
      body: JSON.stringify(bookData)
    });
  }

  async updateBook(id, bookData) {
    return await this.apiCall(`/Books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData)
    });
  }

  async deleteBook(id) {
    return await this.apiCall(`/Books/${id}`, {
      method: 'DELETE'
    });
  }

  async updateBookStock(id, quantity) {
    return await this.apiCall(`/Books/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity })
    });
  }

  // Admin Methods - Authors
  async createAuthor(authorData) {
    return await this.apiCall('/Authors', {
      method: 'POST',
      body: JSON.stringify(authorData)
    });
  }

  async updateAuthor(id, authorData) {
    return await this.apiCall(`/Authors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(authorData)
    });
  }

  async deleteAuthor(id) {
    return await this.apiCall(`/Authors/${id}`, {
      method: 'DELETE'
    });
  }

  // Admin Methods - Categories
  async createCategory(categoryData) {
    return await this.apiCall('/Categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  async updateCategory(id, categoryData) {
    return await this.apiCall(`/Categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  }

  async deleteCategory(id) {
    return await this.apiCall(`/Categories/${id}`, {
      method: 'DELETE'
    });
  }

  // Admin Methods - Publishers
  async createPublisher(publisherData) {
    return await this.apiCall('/Publishers', {
      method: 'POST',
      body: JSON.stringify(publisherData)
    });
  }

  async updatePublisher(id, publisherData) {
    return await this.apiCall(`/Publishers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(publisherData)
    });
  }

  async deletePublisher(id) {
    return await this.apiCall(`/Publishers/${id}`, {
      method: 'DELETE'
    });
  }

  // Admin Methods - Book Inquiries
  async createBookInquiry(inquiryData) {
    return await this.apiCall('/BookInquiries', {
      method: 'POST',
      body: JSON.stringify(inquiryData)
    });
  }

  async updateBookInquiry(id, inquiryData) {
    return await this.apiCall(`/BookInquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(inquiryData)
    });
  }

  async deleteBookInquiry(id) {
    return await this.apiCall(`/BookInquiries/${id}`, {
      method: 'DELETE'
    });
  }

  async getBookInquiries(page = 1, pageSize = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    return await this.apiCall(`/BookInquiries?${params}`);
  }

  async getWhatsAppUrl(bookId, customerData) {
    return await this.apiCall('/BookInquiries/whatsapp-url', {
      method: 'POST',
      body: JSON.stringify({ bookId, ...customerData })
    });
  }

  async registerCustomer(registerData) {
    return await this.apiCall('/Auth/register-customer', {
      method: 'POST',
      body: JSON.stringify(registerData)
    });
  }

  // Calendar/Schedules Methods
  async getSchedules() {
    return await this.apiCall('/Schedules');
  }

  async getSchedule(id) {
    return await this.apiCall(`/Schedules/${id}`);
  }

  async createSchedule(scheduleData) {
    return await this.apiCall('/Schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData)
    });
  }

  async updateSchedule(id, scheduleData) {
    return await this.apiCall(`/Schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData)
    });
  }

  async deleteSchedule(id) {
    return await this.apiCall(`/Schedules/${id}`, {
      method: 'DELETE'
    });
  }

  async uploadScheduleFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return await this.apiCall('/Schedules/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
      }
    });
  }

  // Study Materials Methods
  async getStudyMaterials(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.subject) queryParams.append('subject', filters.subject);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.pageSize) queryParams.append('pageSize', filters.pageSize);
    
    return await this.apiCall(`/StudyMaterials?${queryParams.toString()}`);
  }

  async getStudyMaterialById(id) {
    return await this.apiCall(`/StudyMaterials/${id}`);
  }

  async createStudyMaterial(materialData) {
    return await this.apiCall('/StudyMaterials', {
      method: 'POST',
      body: JSON.stringify(materialData)
    });
  }

  async updateStudyMaterial(id, materialData) {
    return await this.apiCall(`/StudyMaterials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(materialData)
    });
  }

  async deleteStudyMaterial(id) {
    return await this.apiCall(`/StudyMaterials/${id}`, {
      method: 'DELETE'
    });
  }

  async getStudyMaterialCategories() {
    return await this.apiCall('/StudyMaterials/categories');
  }

  async getStudyMaterialSubjects() {
    return await this.apiCall('/StudyMaterials/subjects');
  }

  // Study Tips Methods
  async getStudyTips(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.grade) queryParams.append('grade', filters.grade);
    if (filters.subject) queryParams.append('subject', filters.subject);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.pageSize) queryParams.append('pageSize', filters.pageSize);
    
    return await this.apiCall(`/StudyTips?${queryParams.toString()}`);
  }

  async getStudyTipById(id) {
    return await this.apiCall(`/StudyTips/${id}`);
  }

  async createStudyTip(tipData) {
    return await this.apiCall('/StudyTips', {
      method: 'POST',
      body: JSON.stringify(tipData)
    });
  }

  async updateStudyTip(id, tipData) {
    return await this.apiCall(`/StudyTips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tipData)
    });
  }

  async deleteStudyTip(id) {
    return await this.apiCall(`/StudyTips/${id}`, {
      method: 'DELETE'
    });
  }

  async getStudyTipCategories() {
    return await this.apiCall('/StudyTips/categories');
  }

  async getStudyTipGrades() {
    return await this.apiCall('/StudyTips/grades');
  }

  async getStudyTipSubjects() {
    return await this.apiCall('/StudyTips/subjects');
  }

  // Study Schedules Methods
  async getStudySchedules(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.grade) queryParams.append('grade', filters.grade);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.pageSize) queryParams.append('pageSize', filters.pageSize);
    
    return await this.apiCall(`/StudySchedules?${queryParams.toString()}`);
  }

  async getStudyScheduleById(id) {
    return await this.apiCall(`/StudySchedules/${id}`);
  }

  async createStudySchedule(scheduleData) {
    return await this.apiCall('/StudySchedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData)
    });
  }

  async updateStudySchedule(id, scheduleData) {
    return await this.apiCall(`/StudySchedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData)
    });
  }

  async deleteStudySchedule(id) {
    return await this.apiCall(`/StudySchedules/${id}`, {
      method: 'DELETE'
    });
  }

  async getStudyScheduleTypes() {
    return await this.apiCall('/StudySchedules/types');
  }

  async getStudyScheduleGrades() {
    return await this.apiCall('/StudySchedules/grades');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();

export { apiService as default, fixImageUrl, testImageUrl, getBestImageUrl };

