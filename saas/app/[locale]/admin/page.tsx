import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2024-12-18.acacia' as any,
    });
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) redirect('/auth/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

    if (profile?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
            </div>
        );
    }

    // Fetch Users with online status
    const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, last_seen_at')
        .order('last_seen_at', { ascending: false });

    // Fetch Recent Payments from Stripe
    const payments = await stripe.paymentIntents.list({ limit: 10 });

    // Fetch Pending Artist Applications
    const { data: applications } = await supabase
        .from('artist_applications')
        .select('*')
        .eq('status', 'pending');

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <h1 className="text-4xl font-extrabold tracking-tight">Admin Control Panel</h1>

            {/* User Activity */}
            <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                <h2 className="text-2xl font-semibold mb-4">User Activity</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                <th className="py-4 px-4 font-medium text-zinc-500">Name</th>
                                <th className="py-4 px-4 font-medium text-zinc-500">Email</th>
                                <th className="py-4 px-4 font-medium text-zinc-500">Role</th>
                                <th className="py-4 px-4 font-medium text-zinc-500">Last Seen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.map((user) => (
                                <tr key={user.id} className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                                    <td className="py-4 px-4 font-medium">{user.full_name}</td>
                                    <td className="py-4 px-4 text-zinc-600 dark:text-zinc-400">{user.email}</td>
                                    <td className="py-4 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                            user.role === 'artist' ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-zinc-500">
                                        {user.last_seen_at ? new Date(user.last_seen_at).toLocaleString() : 'Never'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Recent Payments */}
            <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                <h2 className="text-2xl font-semibold mb-4">Recent Stripe Payments</h2>
                <div className="space-y-4">
                    {payments.data.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <div>
                                <p className="font-bold">${(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}</p>
                                <p className="text-sm text-zinc-500">{payment.id}</p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                                {payment.status}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pending Applications */}
            <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                <h2 className="text-2xl font-semibold mb-4 text-amber-600">New Artist Applications</h2>
                {applications?.length === 0 ? (
                    <p className="text-zinc-500">No pending applications.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {applications?.map((app) => (
                            <div key={app.id} className="p-5 border border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl">
                                <h3 className="text-xl font-bold">{app.artist_name}</h3>
                                <p className="text-zinc-600 dark:text-zinc-400 mb-4">{app.genre}</p>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-medium hover:opacity-90 transition-opacity">
                                        Review Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
