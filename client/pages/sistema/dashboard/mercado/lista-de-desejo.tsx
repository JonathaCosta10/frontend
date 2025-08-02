import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Heart,
  Plus,
  Trash2,
  Edit,
  Search,
  TrendingUp,
  TrendingDown,
  Bell,
  BellOff,
  Target,
  Calendar,
  Filter,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import { WishlistApiService } from "@/services/api/entities/wishlistApi";
import {
  WishlistItem,
  WishlistStats,
  AddWishlistItemRequest,
  WishlistFilter,
} from "@/src/entities/Wishlist";

export default function ListaDeDesejo() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistStats, setWishlistStats] = useState<WishlistStats | null>(
    null,
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter state
  const [filter, setFilter] = useState<WishlistFilter>({
    type: "all",
    sortBy: "addedAt",
    sortOrder: "desc",
  });

  // Add form state
  const [addForm, setAddForm] = useState<AddWishlistItemRequest>({
    symbol: "",
    name: "",
    type: "stock",
    targetPrice: 0,
    priceAlert: false,
    notes: "",
  });

  // Load data on component mount
  useEffect(() => {
    loadWishlistData();
    loadWishlistStats();
  }, [filter]);

  const loadWishlistData = async () => {
    setIsLoading(true);
    try {
      const items = await WishlistApiService.getWishlistItems(filter);
      setWishlistItems(items);
    } catch (error) {
      toast({
        title: t("error"),
        description: t("failed_load_wishlist"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadWishlistStats = async () => {
    try {
      const stats = await WishlistApiService.getWishlistStats();
      setWishlistStats(stats);
    } catch (error) {
      console.error("Error loading wishlist stats:", error);
    }
  };

  const handleAddItem = async () => {
    if (!addForm.symbol || !addForm.name || addForm.targetPrice <= 0) {
      toast({
        title: t("error"),
        description: t("fill_required_fields"),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await WishlistApiService.addWishlistItem(addForm);

      toast({
        title: t("success"),
        description: t("item_added_wishlist"),
      });

      setIsAddDialogOpen(false);
      setAddForm({
        symbol: "",
        name: "",
        type: "stock",
        targetPrice: 0,
        priceAlert: false,
        notes: "",
      });

      // Reload data
      await loadWishlistData();
      await loadWishlistStats();
    } catch (error) {
      toast({
        title: t("error"),
        description: t("failed_add_item"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm(t("confirm_remove_item"))) {
      return;
    }

    try {
      await WishlistApiService.deleteWishlistItem(id);
      toast({
        title: t("success"),
        description: t("item_removed_wishlist"),
      });

      // Reload data
      await loadWishlistData();
      await loadWishlistStats();
    } catch (error) {
      toast({
        title: t("error"),
        description: t("failed_remove_item"),
        variant: "destructive",
      });
    }
  };

  const togglePriceAlert = async (item: WishlistItem) => {
    try {
      // Update local state immediately for instant UI feedback
      setWishlistItems((prev) =>
        prev.map((prevItem) =>
          prevItem.id === item.id
            ? { ...prevItem, priceAlert: !prevItem.priceAlert }
            : prevItem,
        ),
      );

      // Then update via API
      await WishlistApiService.updateWishlistItem({
        id: item.id,
        priceAlert: !item.priceAlert,
      });

      toast({
        title: t("success"),
        description: `${t("price_alert_status")} ${!item.priceAlert ? t("price_alert_activated") : t("price_alert_deactivated")}`,
      });
    } catch (error) {
      // Revert local state on error
      setWishlistItems((prev) =>
        prev.map((prevItem) =>
          prevItem.id === item.id
            ? { ...prevItem, priceAlert: item.priceAlert }
            : prevItem,
        ),
      );

      toast({
        title: t("error"),
        description: t("failed_update_alert"),
        variant: "destructive",
      });
    }
  };

  const handleEditItem = (item: WishlistItem) => {
    setEditingItem(item);
    setAddForm({
      symbol: item.symbol,
      name: item.name,
      type: item.type,
      targetPrice: item.targetPrice,
      priceAlert: item.priceAlert,
      notes: item.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateItem = async () => {
    if (
      !editingItem ||
      !addForm.symbol ||
      !addForm.name ||
      addForm.targetPrice <= 0
    ) {
      toast({
        title: t("error"),
        description: t("fill_required_fields"),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await WishlistApiService.updateWishlistItem({
        id: editingItem.id,
        symbol: addForm.symbol,
        name: addForm.name,
        type: addForm.type,
        targetPrice: addForm.targetPrice,
        priceAlert: addForm.priceAlert,
        notes: addForm.notes,
      });

      toast({
        title: t("success"),
        description: t("item_updated_successfully"),
      });

      setIsEditDialogOpen(false);
      setEditingItem(null);
      setAddForm({
        symbol: "",
        name: "",
        type: "stock",
        targetPrice: 0,
        priceAlert: false,
        notes: "",
      });

      // Reload data
      await loadWishlistData();
      await loadWishlistStats();
    } catch (error) {
      toast({
        title: t("error"),
        description: t("failed_update_item"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "stock":
        return "📈";
      case "fii":
        return "🏢";
      case "crypto":
        return "₿";
      case "bond":
        return "📋";
      default:
        return "💰";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "stock":
        return t("stock");
      case "fii":
        return t("fii");
      case "crypto":
        return t("crypto");
      case "bond":
        return t("bond");
      default:
        return t("others");
    }
  };

  const getPriceVariation = (currentPrice: number, targetPrice: number) => {
    const variation = ((currentPrice - targetPrice) / targetPrice) * 100;
    return {
      value: variation,
      isPositive: variation >= 0,
      formatted: `${variation >= 0 ? "+" : ""}${variation.toFixed(2)}%`,
    };
  };

  const filteredItems = wishlistItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <SubscriptionGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-500" />
              <span>{t("wishlist")}</span>
            </h1>
            <p className="text-muted-foreground">
              {t("follow_favorite_assets")}
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("add_asset")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{t("add_asset_to_wishlist")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="symbol">
                      {t("symbol")} {t("required")}
                    </Label>
                    <Input
                      id="symbol"
                      value={addForm.symbol}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          symbol: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder={t("symbol_placeholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">
                      {t("type")} {t("required")}
                    </Label>
                    <Select
                      value={addForm.type}
                      onValueChange={(value: any) =>
                        setAddForm({ ...addForm, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stock">{t("stock")}</SelectItem>
                        <SelectItem value="fii">{t("fii")}</SelectItem>
                        <SelectItem value="crypto">{t("crypto")}</SelectItem>
                        <SelectItem value="bond">{t("bond")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">
                    {t("asset_name")} {t("required")}
                  </Label>
                  <Input
                    id="name"
                    value={addForm.name}
                    onChange={(e) =>
                      setAddForm({ ...addForm, name: e.target.value })
                    }
                    placeholder={t("asset_name_placeholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetPrice">
                    {t("target_price")} {t("required")}
                  </Label>
                  <Input
                    id="targetPrice"
                    type="number"
                    step="0.01"
                    value={addForm.targetPrice}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        targetPrice: Number(e.target.value),
                      })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="priceAlert"
                    checked={addForm.priceAlert}
                    onCheckedChange={(checked) =>
                      setAddForm({ ...addForm, priceAlert: checked })
                    }
                  />
                  <Label htmlFor="priceAlert">{t("enable_price_alert")}</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{t("observations")}</Label>
                  <Textarea
                    id="notes"
                    value={addForm.notes}
                    onChange={(e) =>
                      setAddForm({ ...addForm, notes: e.target.value })
                    }
                    placeholder={t("observations_placeholder")}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    {t("cancel")}
                  </Button>
                  <Button onClick={handleAddItem} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("adding")}
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("add")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {t("edit")} {editingItem?.symbol || t("asset")}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-symbol">
                      {t("symbol")} {t("required")}
                    </Label>
                    <Input
                      id="edit-symbol"
                      value={addForm.symbol}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          symbol: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder={t("symbol_placeholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">
                      {t("type")} {t("required")}
                    </Label>
                    <Select
                      value={addForm.type}
                      onValueChange={(value: any) =>
                        setAddForm({ ...addForm, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stock">{t("stock")}</SelectItem>
                        <SelectItem value="fii">{t("fii")}</SelectItem>
                        <SelectItem value="crypto">{t("crypto")}</SelectItem>
                        <SelectItem value="bond">{t("bond")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-name">
                    {t("asset_name")} {t("required")}
                  </Label>
                  <Input
                    id="edit-name"
                    value={addForm.name}
                    onChange={(e) =>
                      setAddForm({ ...addForm, name: e.target.value })
                    }
                    placeholder={t("asset_name_placeholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-targetPrice">
                    {t("target_price")} {t("required")}
                  </Label>
                  <Input
                    id="edit-targetPrice"
                    type="number"
                    step="0.01"
                    value={addForm.targetPrice}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        targetPrice: Number(e.target.value),
                      })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-priceAlert"
                    checked={addForm.priceAlert}
                    onCheckedChange={(checked) =>
                      setAddForm({ ...addForm, priceAlert: checked })
                    }
                  />
                  <Label htmlFor="edit-priceAlert">
                    {t("enable_price_alert")}
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-notes">{t("observations")}</Label>
                  <Textarea
                    id="edit-notes"
                    value={addForm.notes}
                    onChange={(e) =>
                      setAddForm({ ...addForm, notes: e.target.value })
                    }
                    placeholder={t("observations_placeholder")}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setEditingItem(null);
                      setAddForm({
                        symbol: "",
                        name: "",
                        type: "stock",
                        targetPrice: 0,
                        priceAlert: false,
                        notes: "",
                      });
                    }}
                  >
                    {t("cancel")}
                  </Button>
                  <Button onClick={handleUpdateItem} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("updating")}
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        {t("save_changes")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        {wishlistStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("total_items")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {wishlistStats.totalItems}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("assets_in_list")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("with_alerts")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {wishlistStats.itemsWithAlerts}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("active_alerts")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("average_discount")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {wishlistStats.averageTargetDiscount.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("current_vs_target_price")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("target_value")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(wishlistStats.totalTargetValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("total_target_value")}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search_symbol_name")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={filter.type || "all"}
              onValueChange={(value) =>
                setFilter({
                  ...filter,
                  type: value === "all" ? undefined : (value as any),
                })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all")}</SelectItem>
                <SelectItem value="stock">{t("stocks")}</SelectItem>
                <SelectItem value="fii">{t("fiis")}</SelectItem>
                <SelectItem value="crypto">{t("cryptos")}</SelectItem>
                <SelectItem value="bond">{t("fixed_income")}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={`${filter.sortBy}-${filter.sortOrder}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split("-");
                setFilter({
                  ...filter,
                  sortBy: sortBy as any,
                  sortOrder: sortOrder as any,
                });
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="addedAt-desc">{t("most_recent")}</SelectItem>
                <SelectItem value="addedAt-asc">{t("oldest")}</SelectItem>
                <SelectItem value="name-asc">{t("name_a_z")}</SelectItem>
                <SelectItem value="name-desc">{t("name_z_a")}</SelectItem>
                <SelectItem value="targetPrice-desc">
                  {t("highest_price")}
                </SelectItem>
                <SelectItem value="targetPrice-asc">
                  {t("lowest_price")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Wishlist Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("my_wishlist")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm ? t("no_asset_found") : t("wishlist_empty")}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchTerm
                    ? t("adjust_search_filters")
                    : t("add_assets_to_track")}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("asset")}</TableHead>
                    <TableHead>{t("type")}</TableHead>
                    <TableHead>{t("current_price")}</TableHead>
                    <TableHead>{t("target_price")}</TableHead>
                    <TableHead>{t("variation")}</TableHead>
                    <TableHead>{t("alert")}</TableHead>
                    <TableHead>{t("added_date")}</TableHead>
                    <TableHead>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const variation = getPriceVariation(
                      item.currentPrice,
                      item.targetPrice,
                    );

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">
                              {getTypeIcon(item.type)}
                            </span>
                            <div>
                              <p className="font-medium">{item.symbol}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getTypeLabel(item.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(item.currentPrice)}
                        </TableCell>
                        <TableCell className="text-blue-600 font-semibold">
                          {formatCurrency(item.targetPrice)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-semibold ${
                              variation.isPositive
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {variation.formatted}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePriceAlert(item)}
                            className={
                              item.priceAlert
                                ? "text-red-600 hover:text-red-700"
                                : "text-muted-foreground hover:text-orange-600"
                            }
                            title={
                              item.priceAlert
                                ? t("price_alert_enabled")
                                : t("price_alert_disabled")
                            }
                          >
                            <Bell
                              className={`h-4 w-4 ${item.priceAlert ? "fill-current" : ""}`}
                            />
                          </Button>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(item.addedAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditItem(item)}
                              className="hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </SubscriptionGuard>
  );
}
