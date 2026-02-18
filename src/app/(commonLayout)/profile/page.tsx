
import { getCurrentUser } from "@/actions/user.action";
import ProfileForm from "@/components/modules/profile/ProfileForm";
import { redirect } from "next/navigation";;

export default async function ProfilePage() {
    const result = await getCurrentUser();
    
    if (!result.data || result.error) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-8 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage your personal information and password
                        </p>
                    </div>
                    
                    <div className="px-6 py-8">
                        <ProfileForm user={result.data.user} />
                    </div>
                </div>
            </div>
        </div>
    );
}