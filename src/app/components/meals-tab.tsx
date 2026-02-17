import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import type { ChildData, MealData } from "../hooks/useKidTrackerData";

interface MealsTabProps {
  child: ChildData;
  meals: MealData[];
}

export default function MealsTab({ child, meals }: MealsTabProps) {
  return (
    <div className="space-y-4">
      {/* Child Info Header */}
      <Card>
        <CardHeader>
          <CardTitle>Meal Schedule for {child.name}</CardTitle>
          <CardDescription>{child.classroom} Classroom</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Meal Schedule</CardTitle>
          <CardDescription>This week's menu at {child.classroom}</CardDescription>
        </CardHeader>
        <CardContent>
          {meals.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">No meal schedule available yet.</p>
              <p className="text-gray-400 text-sm mt-1">Meal schedules are posted by the daycare.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meals.map((meal, index) => (
                <div
                  key={meal.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-gray-900">{meal.day}</p>
                      <p className="text-gray-500">{meal.date}</p>
                    </div>
                    {index === 0 && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {meal.breakfast && (
                      <div className="flex">
                        <div className="w-24 flex-shrink-0">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                            </svg>
                            <span className="text-gray-600">Breakfast</span>
                          </div>
                        </div>
                        <p className="text-gray-900">{meal.breakfast}</p>
                      </div>
                    )}

                    {meal.lunch && (
                      <div className="flex">
                        <div className="w-24 flex-shrink-0">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            </svg>
                            <span className="text-gray-600">Lunch</span>
                          </div>
                        </div>
                        <p className="text-gray-900">{meal.lunch}</p>
                      </div>
                    )}

                    {meal.snack && (
                      <div className="flex">
                        <div className="w-24 flex-shrink-0">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-600">Snack</span>
                          </div>
                        </div>
                        <p className="text-gray-900">{meal.snack}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dietary Information */}
      <Card>
        <CardHeader>
          <CardTitle>Dietary Information</CardTitle>
          <CardDescription>For {child.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-gray-900">Allergies</p>
                <p className="text-gray-500">{child.allergies || "None reported"}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-gray-900">Medications</p>
                <p className="text-gray-500">{child.medications || "None"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
