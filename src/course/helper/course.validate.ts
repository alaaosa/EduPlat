// check all required fields for course are filled before sending course for review

import { Injectable } from "@nestjs/common";
import { Course } from "../entities/course.entity";
import { checkSectionBeforeReview } from "./section.validate";

export const checkCourseBeforeReview =async (course: Course) => {
    if (!course.price || course.price < 0) {
        throw new Error(
            "Course must have a price before sending course for review and price must be greater than or equal to 0"
        );
    }

   await checkSectionBeforeReview(course.sections);

}

