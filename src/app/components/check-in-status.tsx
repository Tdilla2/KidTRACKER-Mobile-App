import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import type { ChildData, DailyReportData } from "../hooks/useKidTrackerData";

interface CheckInStatusProps {
  child: ChildData;
  dailyReport: DailyReportData | null;
}

export default function CheckInStatus({ child, dailyReport }: CheckInStatusProps) {
  const status = dailyReport?.attendanceStatus ?? "none";
  // "checked_in" = present and not yet picked up
  // "checked_out" = was here, has been picked up
  // "absent" = marked absent by daycare
  // "none" = no attendance record at all

  const badgeConfig = {
    checked_in: { label: "Checked In", variant: "default" as const, className: "bg-green-100 text-green-700 border-green-200" },
    checked_out: { label: "Checked Out", variant: "default" as const, className: "bg-blue-100 text-blue-700 border-blue-200" },
    absent: { label: "Absent", variant: "destructive" as const, className: "bg-red-100 text-red-700 border-red-200" },
    none: { label: "Absent", variant: "destructive" as const, className: "bg-red-100 text-red-700 border-red-200" },
  };

  const badge = badgeConfig[status];
  const hasAttendance = status === "checked_in" || status === "checked_out";

  return (
    <div className="space-y-4">
      {/* Child Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Child Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            {child.photo ? (
              <img
                src={child.photo}
                alt={child.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-2xl">{child.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <p className="text-gray-900">{child.name}</p>
              <p className="text-gray-500">Age: {child.age} years</p>
              <p className="text-gray-500">Class: {child.classroom}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Check-in Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Check-In Status</CardTitle>
            <Badge variant={badge.variant} className={badge.className}>
              {badge.label}
            </Badge>
          </div>
          <CardDescription>Today, {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Checked In - still at daycare */}
          {status === "checked_in" && dailyReport && (
            <>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-900">Check-In Time</p>
                    <p className="text-gray-500">{dailyReport.checkInTime}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-900">Check-Out Time</p>
                    <p className="text-gray-500">Not checked out yet</p>
                  </div>
                </div>
              </div>

              {dailyReport.checkInBy && (
                <div className="pt-3 border-t">
                  <p className="text-gray-500">Checked in by: {dailyReport.checkInBy}</p>
                </div>
              )}
            </>
          )}

          {/* Checked Out - was here, now picked up */}
          {status === "checked_out" && dailyReport && (
            <>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-900">Check-In Time</p>
                    <p className="text-gray-500">{dailyReport.checkInTime}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-900">Check-Out Time</p>
                    <p className="text-gray-500">{dailyReport.checkOutTime}</p>
                  </div>
                </div>
              </div>

              {dailyReport.checkInBy && (
                <div className="pt-3 border-t">
                  <p className="text-gray-500">Checked in by: {dailyReport.checkInBy}</p>
                </div>
              )}
            </>
          )}

          {/* Absent or no record */}
          {(status === "absent" || status === "none") && (
            <div className="text-center py-6">
              <svg className="w-16 h-16 text-red-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 11-12.728 0M12 9v4m0 4h.01" />
              </svg>
              <p className="text-red-600 font-medium">Absent Today</p>
              <p className="text-gray-500 text-sm mt-1">Your child has not been checked in today.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Photos */}
      {dailyReport && dailyReport.photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Photos</CardTitle>
            <CardDescription>See what {child.name} did today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {dailyReport.photos.map((photo, i) => (
                <div key={i} className="relative group cursor-pointer">
                  <img src={photo.url} alt={photo.caption} className="w-full h-24 object-cover rounded-lg" />
                  <div className="mt-1">
                    <p className="text-gray-900 text-sm">{photo.caption}</p>
                    <p className="text-gray-500 text-xs">{photo.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Report */}
      {dailyReport && hasAttendance && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Report</CardTitle>
            <CardDescription>Today's activities and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Meals */}
            {(dailyReport.breakfastStatus || dailyReport.lunchStatus || dailyReport.snackStatus) && (
              <div className="border-b pb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  <p className="text-gray-900">Meals</p>
                </div>
                <div className="space-y-2 ml-7">
                  {dailyReport.breakfastStatus && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Breakfast</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {dailyReport.breakfastStatus}
                      </Badge>
                    </div>
                  )}
                  {dailyReport.lunchStatus && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Lunch</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {dailyReport.lunchStatus}
                      </Badge>
                    </div>
                  )}
                  {dailyReport.snackStatus && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Snack</span>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        {dailyReport.snackStatus}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Nap Time */}
            {dailyReport.napStart && (
              <div className="border-b pb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                  </svg>
                  <p className="text-gray-900">Nap Time</p>
                </div>
                <div className="ml-7">
                  <p className="text-gray-600">{dailyReport.napStart} - {dailyReport.napEnd || "ongoing"}</p>
                </div>
              </div>
            )}

            {/* Activities */}
            {dailyReport.activities.length > 0 && (
              <div className="border-b pb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-900">Activities</p>
                </div>
                <div className="ml-7 space-y-2">
                  {dailyReport.activities.map((activity, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                      <p className="text-gray-600">{activity}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bathroom */}
            {dailyReport.bathroomNotes && (
              <div className="border-b pb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-900">Bathroom</p>
                </div>
                <div className="ml-7">
                  <p className="text-gray-600">{dailyReport.bathroomNotes}</p>
                </div>
              </div>
            )}

            {/* Mood */}
            {dailyReport.moodNotes && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-900">Mood & Behavior</p>
                </div>
                <div className="ml-7">
                  <p className="text-gray-600">{dailyReport.moodNotes}</p>
                </div>
              </div>
            )}

            {/* Teacher Notes */}
            {dailyReport.teacherNotes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                  <div>
                    <p className="text-blue-900 mb-1">Teacher's Note</p>
                    <p className="text-blue-700 text-sm">{dailyReport.teacherNotes}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No report yet message */}
      {!dailyReport && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">No daily report yet for today.</p>
              <p className="text-gray-400 text-sm mt-1">Reports are created by daycare staff.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}