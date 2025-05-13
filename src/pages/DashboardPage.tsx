
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { StatusChart } from '@/components/dashboard/StatusChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your condominium community</p>
      </div>
      
      <div className="mb-8">
        <DashboardStats />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <CategoryChart />
        <StatusChart />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>Latest community announcements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">Check the Messages tab for community announcements</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Community calendar for the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">No upcoming events scheduled</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
