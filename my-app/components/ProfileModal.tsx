"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { UserProfile } from '@/types'; 
import LogoutButton from "@/components/logoutButton";

interface ProfileModalProps {
  open: boolean;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
  initialData?: UserProfile;
}

const teacherQualifications = [
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate/PhD",
  "Teaching Certificate",
  "Diploma in Education"
];

const studentEducationLevels = [
  "Elementary School",
  "Middle School",
  "High School",
  "Undergraduate",
  "Graduate",
  "Postgraduate"
];

const gradeLevels = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
  "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
  "Freshman", "Sophomore", "Junior", "Senior",
  "Year 1", "Year 2", "Year 3", "Year 4", "Year 5+"
];

const ProfileModal: React.FC<ProfileModalProps> = ({ 
  open, 
  onSave, 
  onClose,
  initialData 
}) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    role: "student",
    age: "",
    subject: "",
    chat_style: "simple", // ✅ Changed from chatStyle to chat_style
    qualification: ""
  });
  
  const [educationLevel, setEducationLevel] = useState("");
  const [grade, setGrade] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExistingProfile, setIsExistingProfile] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
  const [originalEducationLevel, setOriginalEducationLevel] = useState("");
  const [originalGrade, setOriginalGrade] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (open) {
      if (initialData && initialData.id) {
        setIsExistingProfile(true);
        
        const safeInitialData = {
          ...initialData,
          name: initialData.name || "",
          age: initialData.age || "",
          subject: initialData.subject || "",
          chat_style: initialData.chat_style || "simple", // ✅ Fixed
          qualification: initialData.qualification || ""
        };
        
        setOriginalProfile(safeInitialData);
        setProfile(safeInitialData);
        
        if (safeInitialData.qualification && safeInitialData.role === "student") {
          const parts = safeInitialData.qualification.split(' - ');
          if (parts.length === 2) {
            setEducationLevel(parts[0] || "");
            setGrade(parts[1] || "");
            setOriginalEducationLevel(parts[0] || "");
            setOriginalGrade(parts[1] || "");
          } else {
            setEducationLevel(safeInitialData.qualification || "");
            setOriginalEducationLevel(safeInitialData.qualification || "");
          }
        } else {
          setEducationLevel("");
          setGrade("");
          setOriginalEducationLevel("");
          setOriginalGrade("");
        }
      } else {
        setIsExistingProfile(false);
        setOriginalProfile(null);
        setOriginalEducationLevel("");
        setOriginalGrade("");
        setProfile({
          name: "",
          role: "student",
          age: "",
          subject: "",
          chat_style: "simple", // ✅ Fixed
          qualification: ""
        });
        setEducationLevel("");
        setGrade("");
      }
      setHasChanges(false);
    }
  }, [open, initialData]);

  useEffect(() => {
    if (profile.role === "student") {
      if (educationLevel && grade) {
        setProfile(prev => ({ ...prev, qualification: `${educationLevel} - ${grade}` }));
      } else if (educationLevel) {
        setProfile(prev => ({ ...prev, qualification: educationLevel }));
      } else {
        setProfile(prev => ({ ...prev, qualification: "" }));
      }
    }
  }, [educationLevel, grade, profile.role]);

  useEffect(() => {
    if (!originalProfile || !isExistingProfile) {
      setHasChanges(false);
      return;
    }

    const hasNameChanged = profile.name !== originalProfile.name;
    const hasAgeChanged = profile.age !== originalProfile.age.toString();
    const hasSubjectChanged = profile.subject !== originalProfile.subject;
    const hasChatStyleChanged = profile.chat_style !== originalProfile.chat_style; // ✅ Fixed
    
    let hasQualificationChanged = false;
    let hasEducationLevelChanged = false;
    let hasGradeChanged = false;
    
    if (profile.role === "teacher") {
      hasQualificationChanged = profile.qualification !== originalProfile.qualification;
    } else {
      hasEducationLevelChanged = educationLevel !== originalEducationLevel;
      hasGradeChanged = grade !== originalGrade;
      hasQualificationChanged = hasEducationLevelChanged || hasGradeChanged;
    }
    
    const changesExist = hasNameChanged || 
      hasAgeChanged || 
      hasSubjectChanged || 
      hasChatStyleChanged || 
      hasQualificationChanged;
    
    setHasChanges(changesExist);
  }, [profile, educationLevel, grade, originalProfile, originalEducationLevel, originalGrade, isExistingProfile]);

  const isFormValid = () => {
    if (!profile.name?.trim() || !profile.subject?.trim()) {
      return false;
    }
    
    const ageNum = Number(profile.age);
    if (isNaN(ageNum) || ageNum < 5 || ageNum > 100) {
      return false;
    }
    
    if (!profile.chat_style) { // ✅ Fixed
      return false;
    }
    
    if (profile.role === "teacher") {
      if (!profile.qualification?.trim()) {
        return false;
      }
    } else {
      if (!educationLevel?.trim() || !profile.qualification?.trim()) {
        return false;
      }
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      alert("Please fill all required fields correctly");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      // ✅ Now using chat_style consistently
      const profileData = {
        name: profile.name,
        role: profile.role,
        age: Number(profile.age),
        subject: profile.subject,
        chat_style: profile.chat_style, // ✅ Fixed - matches database column
        qualification: profile.qualification,
        updated_at: new Date().toISOString(),
      };
      
      console.log('Saving profile data:', profileData);
      
      if (initialData?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', initialData.id)
          .select()
          .single();
          
        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }
        console.log('Profile updated successfully:', data);
        onSave(data as UserProfile);
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .insert([
            {
              id: session.user.id,
              ...profileData,
              email: session.user.email,
            }
          ])
          .select()
          .single();
          
        if (error) {
          console.error('Supabase insert error:', error);
          throw error;
        }
        console.log('Profile created successfully:', data);
        onSave(data as UserProfile);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert("Error saving profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = () => {
    if (isLoading) return true;
    if (!isFormValid()) return true;
    if (isExistingProfile && !hasChanges) return true;
    return false;
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20 overflow-y-auto max-h-screen"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isExistingProfile ? 'Edit Your Profile' : 'Create Your Profile'}
            </h2>
            <p className="text-gray-600 text-sm">Personalize your learning experience</p>
          </div>
          
          <div className="space-y-4">
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Your Name"
              value={profile.name || ""}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
            />
            
            <div className="relative">
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={profile.role || "student"}
                onChange={e => {
                  const newRole = e.target.value as "student" | "teacher";
                  setProfile({ 
                    ...profile, 
                    role: newRole,
                    qualification: ""
                  });
                  setEducationLevel("");
                  setGrade("");
                }}
                disabled={isExistingProfile}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              type="number"
              placeholder="Age"
              value={profile.age || ""}
              onChange={e => setProfile({ ...profile, age: e.target.value })}
              min="5"
              max="100"
            />
            
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Subject/Field of Interest"
              value={profile.subject || ""}
              onChange={e => setProfile({ ...profile, subject: e.target.value })}
            />
            
            {profile.role === "teacher" ? (
              <>
                <label className="block text-sm font-medium text-gray-700">Highest Qualification</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={profile.qualification || ""}
                  onChange={e => setProfile({ ...profile, qualification: e.target.value })}
                >
                  <option value="">Select your highest qualification</option>
                  {teacherQualifications.map((qual) => (
                    <option key={qual} value={qual}>{qual}</option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <label className="block text-sm font-medium text-gray-700">Education Level</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all mb-2"
                  value={educationLevel || ""}
                  onChange={e => {
                    setEducationLevel(e.target.value);
                    setGrade("");
                  }}
                >
                  <option value="">Select your education level</option>
                  {studentEducationLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                
                {educationLevel && (
                  <>
                    <label className="block text-sm font-medium text-gray-700">
                      {educationLevel.includes("School") ? "Grade" : "Year"}
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={grade || ""}
                      onChange={e => setGrade(e.target.value)}
                    >
                      <option value="">Select your {educationLevel.includes("School") ? "grade" : "year"}</option>
                      {gradeLevels.map((gradeOption) => (
                        <option key={gradeOption} value={gradeOption}>{gradeOption}</option>
                      ))}
                    </select>
                  </>
                )}
              </>
            )}
            
            <label className="block text-sm font-medium text-gray-700">Chat Style Preference</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={profile.chat_style || "simple"} // ✅ Fixed
              onChange={e => setProfile({ ...profile, chat_style: e.target.value })} // ✅ Fixed
            >
              <option value="simple">Simple & Friendly</option>
              <option value="academic">Academic & Detailed</option>
              <option value="conversational">Conversational</option>
              <option value="wise">Wise & Reflective</option>
            </select>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-80 disabled:cursor-not-allowed"
              disabled={isButtonDisabled()}
              onClick={handleSave}
            >
              {isLoading ? 'Saving...' : (isExistingProfile ? 'Update Profile' : 'Save Profile')}
            </button>
          </div>
        </motion.div>
      </div>
      
      <div className="fixed bottom-6 right-6 z-50">
        <LogoutButton />
      </div>
    </>
  );
};

export default ProfileModal;
