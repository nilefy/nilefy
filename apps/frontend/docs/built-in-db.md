# Built-In Database Module Documentation

## Table of Contents

- [Introduction](#introduction)
- [Database Table Creation](#database-table-creation)
- [Table Interaction and Management](#table-interaction-and-management)

## Introduction

The built-in database module is designed to provide essential components for creating, managing, and interacting with tables in the platform. This documentation outlines the key features and functionalities implemented in this module.

## Database Table Creation

The creation of a new table involves utilizing the `DatabaseTable` component, which incorporates form validation and dynamic input handling. Key aspects of this functionality include:

- **Table Schema Definition:**
  - Defines the structure of a table, including columns with properties such as name, type, and default value.
  - Implements initial validation using Zod for ensuring data integrity.

- **Form Handling:**
  - Utilizes the `react-hook-form` library for efficient form management.
  - Dynamically adds and removes columns based on user input.

- **Interaction and State Handling:**
  - Manages state for creating and editing tables.
  - Integrates with the low-code platform's routing system for navigation.

// TODO : PUT IMAGE HERE FOR TABLE CREATION 
## Table Interaction and Management

The module facilitates user interaction and management of existing tables through the `All Tables` interface. Key features include:

- **Table Display and Navigation:**
  - Displays a list of all tables with options for editing and removing.
  - Allows users to navigate between tables and view their details.

- **Table Editing:**
  - Enables users to edit the table name inline.
  - Provides options to save or cancel edits.

- **Dynamic Table Options:**
  - Offers a dropdown menu with edit and remove options.
  - Ensures a seamless user experience with dynamic interactions.

  // IMAGE FOR THE LIST OF TABLES AND THE FUNCTIONALITY OF REMOVING/RENAMING

## Additional Functionality

The module extends its capabilities with additional functionality, including:

- **Adding New Columns and Rows:**
  - Allows users to add new columns and rows to the selected table.
  - Incorporates dialog boxes for a user-friendly experience.

- **Editing Rows:**
  - Provides an option to edit rows within a selected table.

- **Bulk Data Operations:**
  - Supports bulk operations such as uploading data and applying filters.
// TODO : WHEN DONE , ADD IMAGES FOR THESE FUNCTIONALITIES WORKING
The documentation covers the essential aspects of the built-in database module, providing developers with a comprehensive understanding of its structure and functionality.