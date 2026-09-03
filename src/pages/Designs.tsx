import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import type { Design, Owner, Store, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
    Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Image, Store as StoreIcon, Pencil, Link as LinkIcon, RotateCcw, CircleAlert
} from "lucide-react";
import { CategoryManagementDialog } from "@/components/category-management-dialog";
import { CompleteWithOwnerDialog } from "@/components/complete-with-owner-dialog";
import {
    buildCreateDesignSchema, CUSTOM_CATEGORY_VALUE, type CreateDesignForm,
} from "@/lib/validation";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { DesignListSection } from "@/components/design-list-section";


export default function Designs() {
    const [designs, setDesigns] = useState<Design[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [owners, setOwners] = useState<Owner[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [pendingCompleteDesign, setPendingCompleteDesign] = useState<Design | null>(null);

    async function loadAll() {
        const [designsRes, storesRes, ownersRes, categoriesRes] = await Promise.all([
            api.get<Design[]>("/designs"),
            api.get<Store[]>("/stores"),
            api.get<Owner[]>("/owners"),
            api.get<Category[]>("/categories"),
        ]);
        setDesigns(designsRes.data);
        setStores(storesRes.data);
        setOwners(ownersRes.data);
        setCategories(categoriesRes.data);
    }

    useEffect(() => {
        loadAll();
    }, []);

    const storesByOwner = useMemo(() => {
        const groups = new Map<number, { owner: Owner; stores: Store[] }>();
        stores.forEach((store) => {
            const owner = owners.find((o) => o.id === store.ownerId);
            if (!owner) return;
            if (!groups.has(owner.id)) groups.set(owner.id, { owner, stores: [] });
            groups.get(owner.id)!.stores.push(store);
        });
        return Array.from(groups.values());
    }, [stores, owners]);

    const createDesignSchema = useMemo(
        () => buildCreateDesignSchema(categories.map((c) => c.name)),
        [categories]
    );

    const form = useForm<CreateDesignForm>({
        resolver: zodResolver(createDesignSchema),
        defaultValues: { name: "", storeId: "", categoryId: "", categoryName: "", referenceUrl: "" },
    });

    const selectedCategoryValue = form.watch("categoryId");
    const isCustomCategory = selectedCategoryValue === CUSTOM_CATEGORY_VALUE;

    async function onSubmit(values: CreateDesignForm) {
        let resolvedCategoryId: number | undefined;

        if (values.categoryId === CUSTOM_CATEGORY_VALUE) {
            const trimmed = values.categoryName?.trim();
            if (trimmed) {
                const res = await api.post<Category>("/categories", { name: trimmed });
                resolvedCategoryId = res.data.id;
            }
        } else if (values.categoryId) {
            resolvedCategoryId = Number(values.categoryId);
        }

        await api.post("/designs", {
            name: values.name,
            storeId: values.storeId ? Number(values.storeId) : undefined,
            categoryId: resolvedCategoryId,
            referenceUrl: values.referenceUrl || undefined,
        });

        form.reset({ name: "", storeId: "", categoryId: "", categoryName: "", referenceUrl: "" });
        loadAll();
    }

    async function handleToggleComplete(design: Design) {
        if (!design.isCompleted && !design.storeId && !design.ownerId) {
            setPendingCompleteDesign(design);
            return;
        }
        await api.put(`/designs/${design.id}`, { isCompleted: !design.isCompleted });
        loadAll();
    }

    async function handleTogglePinDesign(designId: number) {
        await api.put(`/designs/${designId}/pin`);
        loadAll();
    }

    async function handleDeleteDesign(designId: number) {
        await api.delete(`/designs/${designId}`);
        loadAll();
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto p-4 md:p-8 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-background [&::-webkit-scrollbar-thumb]:bg-chart-2">
                <div className="flex flex-col gap-6">
                    <span className="text-lg font-semibold text-foreground">Designs</span>

                    {/* ==== FORM INLINE — Add Design ==== */}
                    <Card className="p-0 overflow-hidden">
                        <Accordion>
                            <AccordionItem value="add-design" className="border-0">
                                <AccordionTrigger className="px-6 py-4 hover:no-underline cursor-pointer">
                                    <span className="flex items-center gap-2 text-sm font-medium">
                                        Add a Design
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 py-6 border-t">
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <Controller
                                            name="name"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel>Title</FieldLabel>
                                                    <FieldContent className="gap-0">
                                                        <InputGroup>
                                                            <InputGroupAddon align="inline-start"><Image className="size-4" /></InputGroupAddon>
                                                            <InputGroupInput aria-invalid={fieldState.invalid} placeholder="Design title..." {...field} />
                                                        </InputGroup>
                                                        {fieldState.invalid && (
                                                            <Alert className="mt-3 flex p-2 rounded-md text-destructive bg-destructive/10 border-destructive/10">
                                                                <CircleAlert className="size-4" />
                                                                <AlertDescription><FieldError errors={[fieldState.error]} /></AlertDescription>
                                                            </Alert>
                                                        )}
                                                    </FieldContent>
                                                </Field>
                                            )}
                                        />

                                        <Controller
                                            name="storeId"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel>Store</FieldLabel>
                                                    <FieldContent className="gap-0">
                                                        <div className="flex items-center gap-2">
                                                            <InputGroup className="flex-1">
                                                                <InputGroupAddon align="inline-start"><StoreIcon className="size-4" /></InputGroupAddon>
                                                                <Select
                                                                    key={field.value || "empty-store"}
                                                                    value={field.value || undefined}
                                                                    onValueChange={field.onChange}
                                                                    disabled={stores.length === 0}
                                                                >
                                                                    <SelectTrigger aria-invalid={fieldState.invalid} className="h-9 w-full rounded-none border-0 bg-transparent! shadow-none focus-visible:ring-0">
                                                                        <SelectValue placeholder={stores.length === 0 ? "No stores yet" : "Select store (optional)"}>
                                                                            {stores.find((s) => String(s.id) === field.value)?.name}
                                                                        </SelectValue>
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {storesByOwner.map(({ owner, stores: ownerStores }) => (
                                                                            <SelectGroup key={owner.id}>
                                                                                <SelectLabel>{owner.name}</SelectLabel>
                                                                                {ownerStores.map((s) => (
                                                                                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                                                                ))}
                                                                            </SelectGroup>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </InputGroup>
                                                            {field.value ? (
                                                                <Button type="button" variant="ghost" size="icon" onClick={() => field.onChange("")} aria-label="Clear store">
                                                                    <RotateCcw className="size-4" />
                                                                </Button>
                                                            ) : null}
                                                        </div>
                                                        {fieldState.invalid && (
                                                            <Alert className="mt-3 flex p-2 rounded-md text-destructive bg-destructive/10 border-destructive/10">
                                                                <CircleAlert className="size-4" />
                                                                <AlertDescription><FieldError errors={[fieldState.error]} /></AlertDescription>
                                                            </Alert>
                                                        )}
                                                    </FieldContent>
                                                </Field>
                                            )}
                                        />

                                        {!isCustomCategory ? (
                                            <Controller
                                                name="categoryId"
                                                control={form.control}
                                                render={({ field, fieldState }) => (
                                                    <Field data-invalid={fieldState.invalid}>
                                                        <FieldLabel>Category</FieldLabel>
                                                        <FieldContent className="gap-0">
                                                            <div className="flex items-center gap-2">
                                                                <InputGroup className="flex-1">
                                                                    <InputGroupAddon align="inline-start"><Pencil className="size-4" /></InputGroupAddon>
                                                                    <Select
                                                                        key={field.value || "empty-category"}
                                                                        value={field.value || undefined}
                                                                        onValueChange={(value) => {
                                                                            field.onChange(value);
                                                                            form.setValue("categoryName", "", { shouldDirty: true, shouldTouch: true, shouldValidate: false });
                                                                            form.clearErrors("categoryName");
                                                                        }}
                                                                    >
                                                                        <SelectTrigger aria-invalid={fieldState.invalid} className="h-9 w-full rounded-none border-0 bg-transparent! shadow-none focus-visible:ring-0">
                                                                            <SelectValue placeholder="Select category (optional)">
                                                                                {categories.find((c) => String(c.id) === field.value)?.name}
                                                                            </SelectValue>
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectGroup>
                                                                                <SelectLabel>Actions</SelectLabel>
                                                                                <SelectItem value={CUSTOM_CATEGORY_VALUE}>Add new category</SelectItem>
                                                                            </SelectGroup>
                                                                            {categories.length > 0 && (
                                                                                <SelectGroup>
                                                                                    <SelectSeparator />
                                                                                    <SelectLabel>Existing Categories</SelectLabel>
                                                                                    {categories.map((c) => (
                                                                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                                                                    ))}
                                                                                </SelectGroup>
                                                                            )}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </InputGroup>
                                                                {field.value ? (
                                                                    <Button
                                                                        type="button" variant="ghost" size="icon"
                                                                        onClick={() => { field.onChange(""); form.setValue("categoryName", ""); }}
                                                                        aria-label="Clear category"
                                                                    >
                                                                        <RotateCcw className="size-4" />
                                                                    </Button>
                                                                ) : null}
                                                            </div>
                                                            {fieldState.invalid && (
                                                                <Alert className="mt-3 flex p-2 rounded-md text-destructive bg-destructive/10 border-destructive/10">
                                                                    <CircleAlert className="size-4" />
                                                                    <AlertDescription><FieldError errors={[fieldState.error]} /></AlertDescription>
                                                                </Alert>
                                                            )}
                                                        </FieldContent>
                                                    </Field>
                                                )}
                                            />
                                        ) : (
                                            <Controller
                                                name="categoryName"
                                                control={form.control}
                                                render={({ field, fieldState }) => (
                                                    <Field data-invalid={fieldState.invalid}>
                                                        <FieldLabel>Category</FieldLabel>
                                                        <FieldContent className="gap-0">
                                                            <div className="flex items-center gap-2">
                                                                <InputGroup className="flex-1">
                                                                    <InputGroupAddon align="inline-start"><Pencil className="size-4" /></InputGroupAddon>
                                                                    <InputGroupInput aria-invalid={fieldState.invalid} placeholder="Category name..." value={field.value ?? ""} onChange={field.onChange} />
                                                                </InputGroup>
                                                                <Button
                                                                    type="button" variant="ghost" size="icon"
                                                                    onClick={() => { form.setValue("categoryId", ""); form.setValue("categoryName", ""); form.clearErrors("categoryName"); }}
                                                                    aria-label="Back to category list"
                                                                >
                                                                    <RotateCcw className="size-4" />
                                                                </Button>
                                                            </div>
                                                            {fieldState.invalid && (
                                                                <Alert className="mt-3 flex p-2 rounded-md text-destructive bg-destructive/10 border-destructive/10">
                                                                    <CircleAlert className="size-4" />
                                                                    <AlertDescription><FieldError errors={[fieldState.error]} /></AlertDescription>
                                                                </Alert>
                                                            )}
                                                        </FieldContent>
                                                    </Field>
                                                )}
                                            />
                                        )}

                                        <Controller
                                            name="referenceUrl"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel>References</FieldLabel>
                                                    <FieldContent className="gap-0">
                                                        <InputGroup>
                                                            <InputGroupAddon align="inline-start"><LinkIcon className="size-4" /></InputGroupAddon>
                                                            <InputGroupInput aria-invalid={fieldState.invalid} placeholder="https://example.com" value={field.value ?? ""} onChange={field.onChange} />
                                                        </InputGroup>
                                                        {fieldState.invalid && (
                                                            <Alert className="mt-3 flex p-2 rounded-md text-destructive bg-destructive/10 border-destructive/10">
                                                                <CircleAlert className="size-4" />
                                                                <AlertDescription><FieldError errors={[fieldState.error]} /></AlertDescription>
                                                            </Alert>
                                                        )}
                                                    </FieldContent>
                                                </Field>
                                            )}
                                        />

                                        <div className="flex items-center justify-between border-t pt-4">
                                            <CategoryManagementDialog categories={categories} onChanged={loadAll} />
                                            <div className="flex items-center gap-2">
                                                <Button type="button" variant="outline" onClick={() => form.reset()}>Reset</Button>
                                                <Button type="submit">Submit</Button>
                                            </div>
                                        </div>
                                    </form>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </Card>

                    {/* ==== LIST DESIGNS ==== */}
                    <div className="flex flex-col bg-card p-6 rounded-xl">
                        <DesignListSection
                            title="All Designs"
                            designs={designs}
                            categories={categories}
                            stores={stores}
                            owners={owners}
                            onToggleComplete={handleToggleComplete}
                            onTogglePin={handleTogglePinDesign}
                            onDelete={handleDeleteDesign}
                            onUpdated={loadAll}
                        />
                    </div>

                    <CompleteWithOwnerDialog
                        design={pendingCompleteDesign}
                        owners={owners}
                        onClose={() => setPendingCompleteDesign(null)}
                        onCompleted={loadAll}
                    />
                </div>
            </div>
        </div>
    );
}