/**
 * Product List Page
 * Displays paginated products with search and filtering
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    ShoppingBag,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import productService, { Product } from '@/services/productService';
import api from '@/services/api';
import { toast } from 'sonner';

export default function ProductListPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState<string>('all');
    const [status, setStatus] = useState<string>('all');
    const [featured, setFeatured] = useState<string>('all');
    const [stockStatus, setStockStatus] = useState<string>('all');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            // Flatten categories for the dropdown
            const flatten = (items: any[]): any[] => {
                let result: any[] = [];
                items.forEach(item => {
                    result.push(item);
                    if (item.children && item.children.length > 0) {
                        result = [...result, ...flatten(item.children)];
                    }
                });
                return result;
            };
            setCategories(flatten(res.data.data));
        } catch (error) {
            console.error('Failed to fetch categories');
        }
    };
    const fetchProducts = async (page = 1) => {
        setLoading(true);
        try {
            const params: any = { 
                page, 
                limit: pagination.limit, 
                search 
            };
            
            if (categoryId !== 'all') params.category_id = Number(categoryId);
            if (status !== 'all') params.status = status;
            if (featured !== 'all') params.featured = featured;
            if (stockStatus !== 'all') params.stock_status = stockStatus;

            const res = await productService.getProducts(params);
            setProducts(res.products);
            setPagination({
                page: res.pagination.current_page,
                limit: res.pagination.per_page,
                total: res.pagination.total,
                totalPages: res.pagination.total_pages
            });
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts(1);
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [search, categoryId, status, featured, stockStatus]);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await productService.deleteProduct(deleteId);
            toast.success('Product deleted successfully');
            fetchProducts(pagination.page);
        } catch (error) {
            toast.error('Failed to delete product');
        } finally {
            setDeleteId(null);
        }
    };

    const handleDuplicate = async (id: number) => {
        try {
            await productService.duplicateProduct(id);
            toast.success('Product duplicated successfully');
            fetchProducts(pagination.page);
        } catch (error) {
            toast.error('Failed to duplicate product');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products</h1>
                    <p className="text-slate-500 text-sm">Manage your inventory, pricing and stock status.</p>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link to="/admin/products/create">
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Link>
                </Button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col gap-4">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search products..."
                        className="pl-9 h-10 w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <select 
                        className="h-10 px-3 py-2 min-w-[150px] rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    <select 
                        className="h-10 px-3 py-2 min-w-[150px] rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="all">Any Status</option>
                        <option value="1">Active</option>
                        <option value="0">Draft</option>
                    </select>

                    <select 
                        className="h-10 px-3 py-2 min-w-[150px] rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={featured}
                        onChange={(e) => setFeatured(e.target.value)}
                    >
                        <option value="all">All Items</option>
                        <option value="1">Featured</option>
                        <option value="0">Non-Featured</option>
                    </select>

                    <select 
                        className="h-10 px-3 py-2 min-w-[150px] rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={stockStatus}
                        onChange={(e) => setStockStatus(e.target.value)}
                    >
                        <option value="all">Stock Status</option>
                        <option value="in_stock">In Stock</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                    </select>

                    <Button 
                        variant="outline" 
                        className="h-10 text-slate-500 hover:text-slate-900"
                        onClick={() => {
                            setSearch('');
                            setCategoryId('all');
                            setStatus('all');
                            setFeatured('all');
                            setStockStatus('all');
                        }}
                    >
                        Reset
                    </Button>
                </div>
            </div>
            {/* Product Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Product Info</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    {[...Array(7)].map((_, j) => (
                                        <TableCell key={j}><div className="h-10 bg-slate-100 animate-pulse rounded"></div></TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-20 text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <ShoppingBag className="h-12 w-12 opacity-10" />
                                        <p>No products found matching your criteria</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id} className="group hover:bg-slate-50/50">
                                    <TableCell>
                                        <div className="w-12 h-12 rounded-lg bg-slate-100 border overflow-hidden shrink-0 flex items-center justify-center">
                                            {product.featured_image_url ? (
                                                <img
                                                    src={product.featured_image_url}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <ShoppingBag className="w-6 h-6 text-slate-300" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors uppercase text-xs tracking-tight">
                                                {product.name}
                                            </p>
                                            <p className="text-xs text-slate-400 font-mono mt-0.5">{product.sku || 'NO-SKU'}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-normal text-[10px] bg-slate-100 text-slate-600">
                                            {product.category_name || 'Uncategorized'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <span className="font-bold text-slate-900">£{product.price}</span>
                                            {product.originalPrice && (
                                                <p className="text-[10px] text-slate-400 line-through">£{product.originalPrice}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            {product.stock_quantity <= product.low_stock_threshold ? (
                                                <>
                                                    <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                                                    <span className="text-xs font-semibold text-orange-600">{product.stock_quantity} Low</span>
                                                </>
                                            ) : (
                                                <span className="text-xs font-medium text-slate-600">{product.stock_quantity} in stock</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {product.is_active ? (
                                            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 gap-1.5">
                                                <CheckCircle2 className="w-3 h-3" /> Active
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-slate-200 gap-1.5">
                                                <XCircle className="w-3 h-3" /> Draft
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/admin/products/edit/${product.id}`} className="cursor-pointer">
                                                        <Edit className="mr-2 h-4 w-4" /> Edit Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer">
                                                    <Eye className="mr-2 h-4 w-4" /> View Store
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer" onClick={() => handleDuplicate(product.id)}>
                                                    <Copy className="mr-2 h-4 w-4" /> Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:bg-red-50 cursor-pointer"
                                                    onClick={() => setDeleteId(product.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Simple Pagination */}
                <div className="px-6 py-4 border-t flex items-center justify-between text-sm text-slate-500">
                    <p>Showing <b>{products.length}</b> of <b>{pagination.total}</b> products</p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page <= 1}
                            onClick={() => fetchProducts(pagination.page - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => fetchProducts(pagination.page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product
                            and all its associated images from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete Product
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
