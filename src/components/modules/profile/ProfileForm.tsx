"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateUserProfile } from "@/actions/user.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, User, Mail, Phone, Lock, Camera } from "lucide-react";

interface ProfileFormProps {
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        image?: string;
    };
}

export default function ProfileForm({ user }: ProfileFormProps) {
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(user.image || "");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const toastId = toast.loading("Updating profile...");
        
        const result = await updateUserProfile(user.id, {
            name: formData.get("name") as string,
            phone: formData.get("phone") as string,
            image: formData.get("image") as string,
            currentPassword: formData.get("currentPassword") as string || undefined,
            newPassword: formData.get("newPassword") as string || undefined,
        });

        if (result.success) {
            toast.success(result.message, { id: toastId });
            router.refresh();
            
            // Clear password fields
            const form = e.target as HTMLFormElement;
            if (form.currentPassword) form.currentPassword.value = "";
            if (form.newPassword) form.newPassword.value = "";
        } else {
            toast.error(result.message, { id: toastId });
        }

        setLoading(false);
    }

    const handleCancel = async () => {
        router.back();
    };

    return (
        <Card className="border-green-200 shadow-sm">
            <div className="p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-green-800">Edit Profile</h3>
                    <p className="text-sm text-gray-600 mt-1">Update your personal information</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <FieldGroup>
                        {/* Profile Image */}
                        <div className="flex items-center space-x-6">
                            <div className="relative group">
                                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-green-100 border-4 border-green-200">
                                    {previewImage ? (
                                        <Image 
                                            src={previewImage} 
                                            alt={user.name}
                                            fill
                                            className="object-cover"
                                            unoptimized={true}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 text-white text-3xl font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-green-600 rounded-full p-2 shadow-lg group-hover:bg-green-700 transition-colors duration-200">
                                    <Camera className="h-4 w-4 text-white" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <Field>
                                    <FieldLabel className="text-sm font-medium text-green-700">
                                        Profile Image URL
                                    </FieldLabel>
                                    <div className="relative">
                                        <Input
                                            type="url"
                                            name="image"
                                            defaultValue={user.image || ""}
                                            onChange={(e) => setPreviewImage(e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            className="border-green-300 focus:ring-green-500 focus:border-green-500 h-10 hover:cursor-text pl-10"
                                        />
                                        <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                                    </div>
                                    <p className="text-xs text-green-600 mt-1">
                                        Enter a valid image URL to see preview
                                    </p>
                                </Field>
                            </div>
                        </div>

                        {/* Basic Info Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                            {/* Full Name */}
                            <Field>
                                <FieldLabel className="text-sm font-medium text-green-700">
                                    Full Name *
                                </FieldLabel>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        name="name"
                                        defaultValue={user.name}
                                        required
                                        placeholder="Enter your full name"
                                        className="border-green-300 focus:ring-green-500 focus:border-green-500 h-10 hover:cursor-text pl-10"
                                    />
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                                </div>
                            </Field>

                            {/* Email (Disabled) */}
                            <Field>
                                <FieldLabel className="text-sm font-medium text-green-700">
                                    Email Address
                                </FieldLabel>
                                <div className="relative">
                                    <Input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full px-3 py-2 border border-green-300 rounded-md bg-green-50 text-gray-500 cursor-not-allowed pl-10"
                                    />
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
                                </div>
                                <p className="text-xs text-green-600 mt-1">Email cannot be changed</p>
                            </Field>

                            {/* Phone Number */}
                            <Field>
                                <FieldLabel className="text-sm font-medium text-green-700">
                                    Phone Number
                                </FieldLabel>
                                <div className="relative">
                                    <Input
                                        type="tel"
                                        name="phone"
                                        defaultValue={user.phone || ""}
                                        placeholder="+8801XXXXXXXXX"
                                        className="border-green-300 focus:ring-green-500 focus:border-green-500 h-10 hover:cursor-text pl-10"
                                    />
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                                </div>
                            </Field>
                        </div>

                        <div className="border-t border-green-200 pt-6 mt-4">
                            <h3 className="text-lg font-medium text-green-800 mb-2">Change Password</h3>
                            <p className="text-sm text-green-600 mb-4">
                                Leave blank if you dont want to change your password
                            </p>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Field>
                                    <FieldLabel className="text-sm font-medium text-green-700">
                                        Current Password
                                    </FieldLabel>
                                    <div className="relative">
                                        <Input
                                            type={showCurrentPassword ? "text" : "password"}
                                            name="currentPassword"
                                            placeholder="Enter current password"
                                            className="border-green-300 focus:ring-green-500 focus:border-green-500 h-10 hover:cursor-text pl-10 pr-10"
                                        />
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-700 focus:outline-none"
                                        >
                                            {showCurrentPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </Field>

                                {/* New Password */}
                                <Field>
                                    <FieldLabel className="text-sm font-medium text-green-700">
                                        New Password
                                    </FieldLabel>
                                    <div className="relative">
                                        <Input
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            placeholder="Enter new password"
                                            className="border-green-300 focus:ring-green-500 focus:border-green-500 h-10 hover:cursor-text pl-10 pr-10"
                                        />
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-700 focus:outline-none"
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </Field>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-green-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                className="border-green-300 text-green-700 hover:bg-green-50 h-10 px-6 hover:cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700 text-white h-10 px-6 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </FieldGroup>
                </form>
            </div>
        </Card>
    );
}