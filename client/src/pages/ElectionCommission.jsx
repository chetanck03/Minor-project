import EmergencyDeclare from "../components/ElectionCommission/EmergencyDeclare";
import ResetElection from "../components/ElectionCommission/ResetElection";

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Emergency Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <EmergencyDeclare />
            <ResetElection />
          </CardContent>
        </Card>
      </div> 