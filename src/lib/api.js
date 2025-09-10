import { supabase } from './supabaseClient';

class ApiService {
  // --- Authentication Methods ---
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  async isAuthenticated() {
    const user = await this.getCurrentUser();
    return !!user;
  }

  async isAdmin() {
    const user = await this.getCurrentUser();
    // This assumes you have a 'role' field in your user's app_metadata
    // You might need to adjust this based on your Supabase setup
    const isAdmin = user && (user.app_metadata.role === 'Admin' || user.app_metadata.role === 'Librarian');
    return isAdmin;
  }

  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // for things like full_name, role, etc.
      },
    });
    if (error) throw error;
    return data;
  }

  // --- Book Methods ---
  async getBooks(page = 1, pageSize = 12, searchTerm = '', categoryId = null, authorId = null) {
    let query = supabase.from('books').select('*');

    if (searchTerm) {
      query = query.ilike('title', `%${searchTerm}%`);
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (authorId) {
      query = query.eq('author_id', authorId);
    }

    const { data, error } = await query.range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;
    return data;
  }

  async getBook(id) {
    const { data, error } = await supabase.from('books').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async getFeaturedBooks() {
    const { data, error } = await supabase.from('books').select('*').eq('is_featured', true).limit(10);
    if (error) throw error;
    return data;
  }

  async getNewReleases() {
    const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: false }).limit(10);
    if (error) throw error;
    return data;
  }

  async getBooksByCategory(categoryId) {
    const { data, error } = await supabase.from('books').select('*').eq('category_id', categoryId);
    if (error) throw error;
    return data;
  }

  async getBooksByAuthor(authorId) {
    const { data, error } = await supabase.from('books').select('*').eq('author_id', authorId);
    if (error) throw error;
    return data;
  }

  // --- Category Methods ---
  async getCategories() {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    return data;
  }

  async getCategory(id) {
    const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  // --- Author Methods ---
  async getAuthors() {
    const { data, error } = await supabase.from('authors').select('*');
    if (error) throw error;
    return data;
  }

  async getAuthor(id) {
    const { data, error } = await supabase.from('authors').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  // --- Publisher Methods ---
  async getPublishers() {
    const { data, error } = await supabase.from('publishers').select('*');
    if (error) throw error;
    return data;
  }

  async getPublisher(id) {
    const { data, error } = await supabase.from('publishers').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  // --- Dashboard Methods ---
  async getDashboardStats() {
    // This would need to be implemented with RPC calls to your Supabase database
    // For now, returning mock data.
    console.warn('getDashboardStats is not fully implemented for Supabase yet.');
    return {
      totalBooks: 0,
      totalAuthors: 0,
      totalCategories: 0,
      totalPublishers: 0,
    };
  }

  // --- Admin Methods - Books ---
  async createBook(bookData) {
    const { data, error } = await supabase.from('books').insert([bookData]).select();
    if (error) throw error;
    return data;
  }

  async updateBook(id, bookData) {
    const { data, error } = await supabase.from('books').update(bookData).eq('id', id).select();
    if (error) throw error;
    return data;
  }

  async deleteBook(id) {
    const { data, error } = await supabase.from('books').delete().eq('id', id);
    if (error) throw error;
    return data;
  }

  async updateBookStock(id, quantity) {
    const { data, error } = await supabase.from('books').update({ stock_quantity: quantity }).eq('id', id).select();
    if (error) throw error;
    return data;
  }

  async uploadImage(file) {
    const filePath = `public/${file.name}`;
    const { data, error } = await supabase.storage.from('book-covers').upload(filePath, file);
    if (error) throw error;
    return data;
  }

  // --- Admin Methods - Products ---
  async getProducts(filters = {}) {
    let query = supabase.from('products').select('*');

    if (filters.name) {
      query = query.ilike('name', `%${filters.name}%`);
    }
    if (filters.product_type_id) {
      query = query.eq('product_type_id', filters.product_type_id);
    }
    if (filters.grade_id) {
      query = query.eq('grade_id', filters.grade_id);
    }
    if (filters.subject_id) {
      query = query.eq('subject_id', filters.subject_id);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async getProductById(id) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async createProduct(productData) {
    const { data, error } = await supabase.from('products').insert([productData]).select();
    if (error) throw error;
    return data;
  }

  async updateProduct(id, productData) {
    const { data, error } = await supabase.from('products').update(productData).eq('id', id).select();
    if (error) throw error;
    return data;
  }

  async deleteProduct(id) {
    const { data, error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return data;
  }

  async getProductTypes() {
    const { data, error } = await supabase.from('product_types').select('*');
    if (error) throw error;
    return data;
  }

  async getGrades() {
    const { data, error } = await supabase.from('grades').select('*');
    if (error) throw error;
    return data;
  }

  async getSubjects() {
    const { data, error } = await supabase.from('subjects').select('*');
    if (error) throw error;
    return data;
  }

  // --- Admin Methods - Authors ---
  async createAuthor(authorData) {
    const { data, error } = await supabase.from('authors').insert([authorData]).select();
    if (error) throw error;
    return data;
  }

  async updateAuthor(id, authorData) {
    const { data, error } = await supabase.from('authors').update(authorData).eq('id', id).select();
    if (error) throw error;
    return data;
  }

  async deleteAuthor(id) {
    const { data, error } = await supabase.from('authors').delete().eq('id', id);
    if (error) throw error;
    return data;
  }

  // --- Admin Methods - Categories ---
  async createCategory(categoryData) {
    const { data, error } = await supabase.from('categories').insert([categoryData]).select();
    if (error) throw error;
    return data;
  }

  async updateCategory(id, categoryData) {
    const { data, error } = await supabase.from('categories').update(categoryData).eq('id', id).select();
    if (error) throw error;
    return data;
  }

  async deleteCategory(id) {
    const { data, error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    return data;
  }

  // --- Admin Methods - Publishers ---
  async createPublisher(publisherData) {
    const { data, error } = await supabase.from('publishers').insert([publisherData]).select();
    if (error) throw error;
    return data;
  }

  async updatePublisher(id, publisherData) {
    const { data, error } = await supabase.from('publishers').update(publisherData).eq('id', id).select();
    if (error) throw error;
    return data;
  }

  async deletePublisher(id) {
    const { data, error } = await supabase.from('publishers').delete().eq('id', id);
    if (error) throw error;
    return data;
  }
}

const apiService = new ApiService();
export default apiService;
