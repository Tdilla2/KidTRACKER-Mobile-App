import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import type { ChildData } from "../hooks/useKidTrackerData";

interface ProfileTabProps {
  child: ChildData;
  onUpdateProfile: (updates: Partial<ChildData>) => Promise<void>;
}

export default function ProfileTab({ child, onUpdateProfile }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable parent fields
  const [parentName, setParentName] = useState(child.parentName);
  const [parentPhone, setParentPhone] = useState(child.parentPhone);
  const [parentAddress, setParentAddress] = useState(child.parentAddress);

  // Editable child fields
  const [childName, setChildName] = useState(child.name);
  const [childAge, setChildAge] = useState(child.age.toString());
  const [childClassroom, setChildClassroom] = useState(child.classroom);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateProfile({
        parentName,
        parentPhone,
        parentAddress,
        name: childName,
        age: parseInt(childAge),
        classroom: childClassroom,
      });
      setIsEditing(false);
    } catch {
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setParentName(child.parentName);
    setParentPhone(child.parentPhone);
    setParentAddress(child.parentAddress);
    setChildName(child.name);
    setChildAge(child.age.toString());
    setChildClassroom(child.classroom);
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      {/* Save/Cancel Buttons */}
      {isEditing && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-gray-700">You have unsaved changes</p>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Parent Information */}
      <Card>
        <CardHeader>
          <CardTitle>Parent Information</CardTitle>
          <CardDescription>Your contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-gray-500 mb-1">Full Name</p>
            <Input
              value={parentName}
              onChange={(e) => { setParentName(e.target.value); setIsEditing(true); }}
              className="mt-1"
            />
          </div>
          <div>
            <p className="text-gray-500 mb-1">Email Address</p>
            <Input type="email" value={child.parentEmail} disabled className="mt-1 bg-gray-50" />
            <p className="text-xs text-gray-400 mt-1">Email is managed through your account settings</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Phone Number</p>
            <Input
              type="tel"
              value={parentPhone}
              onChange={(e) => { setParentPhone(e.target.value); setIsEditing(true); }}
              className="mt-1"
            />
          </div>
          <div>
            <p className="text-gray-500 mb-1">Address</p>
            <Input
              value={parentAddress}
              onChange={(e) => { setParentAddress(e.target.value); setIsEditing(true); }}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Child Information */}
      <Card>
        <CardHeader>
          <CardTitle>Child Information</CardTitle>
          <CardDescription>Enrolled child details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            {child.photo ? (
              <img src={child.photo} alt={child.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-xl">{child.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <p className="text-gray-900">{childName}</p>
              <p className="text-gray-500">{childClassroom}</p>
            </div>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Child's Full Name</p>
            <Input
              value={childName}
              onChange={(e) => { setChildName(e.target.value); setIsEditing(true); }}
              className="mt-1"
            />
          </div>
          <div>
            <p className="text-gray-500 mb-1">Age (years)</p>
            <Input
              type="number"
              value={childAge}
              onChange={(e) => { setChildAge(e.target.value); setIsEditing(true); }}
              className="mt-1"
              min="0"
              max="12"
            />
          </div>
          <div>
            <p className="text-gray-500 mb-1">Classroom</p>
            <Input
              value={childClassroom}
              onChange={(e) => { setChildClassroom(e.target.value); setIsEditing(true); }}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contacts</CardTitle>
          <CardDescription>Additional authorized contacts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {child.emergencyContacts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No emergency contacts added yet.</p>
          ) : (
            child.emergencyContacts.map((contact, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-900 mb-1">{contact.name}</p>
                <p className="text-gray-500">{contact.relationship}</p>
                <p className="text-gray-500">{contact.phone}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Authorized Pickups */}
      <Card>
        <CardHeader>
          <CardTitle>Authorized Pickup</CardTitle>
          <CardDescription>People authorized to pick up your child</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {child.authorizedPickups.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No authorized pickups added yet.</p>
          ) : (
            child.authorizedPickups.map((pickup, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-gray-900">{pickup.name}</p>
                  <p className="text-gray-500">{pickup.relationship}</p>
                </div>
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Information</CardTitle>
          <CardDescription>Health and allergy information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-gray-500 mb-1">Allergies</p>
            <p className="text-gray-900">{child.allergies || "None reported"}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Medications</p>
            <p className="text-gray-900">{child.medications || "None"}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Pediatrician</p>
            <p className="text-gray-900">{child.pediatrician || "Not specified"}</p>
            {child.pediatricianPhone && (
              <p className="text-gray-500">{child.pediatricianPhone}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
