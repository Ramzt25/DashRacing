export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-primary">Dash Admin</h1>
          <p className="text-text-muted mt-2">Platform administration and moderation</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-primary">1,234</p>
            <p className="text-text-muted text-sm">+12% from last week</p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Active Meets</h3>
            <p className="text-3xl font-bold text-accent">56</p>
            <p className="text-text-muted text-sm">+8% from last week</p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Community Pins</h3>
            <p className="text-3xl font-bold text-success">892</p>
            <p className="text-text-muted text-sm">+24% from last week</p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Open Reports</h3>
            <p className="text-3xl font-bold text-danger">3</p>
            <p className="text-text-muted text-sm">-2 from yesterday</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <span className="text-text-primary">New user registered</span>
                <span className="text-text-muted text-sm">2 min ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <span className="text-text-primary">Meet created in Los Angeles</span>
                <span className="text-text-muted text-sm">5 min ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <span className="text-text-primary">Pin reported and reviewed</span>
                <span className="text-text-muted text-sm">12 min ago</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="btn btn-primary w-full">Review Reports</button>
              <button className="btn btn-secondary w-full">Verify Meets</button>
              <button className="btn btn-secondary w-full">Manage Feature Flags</button>
              <button className="btn btn-secondary w-full">View Analytics</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}