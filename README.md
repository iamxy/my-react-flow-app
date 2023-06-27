# Instruction my-react-flow-app

This application is designed to visualize the instructions from a JSON file as a flowchart. It supports showing various instruction types such as sequential instructions, conditional instructions with 'If' statements, and loop instructions with 'Loop' statements.

## Prerequisites
Before you begin, ensure you have met the following requirements:

- You have installed Node.js and npm. You can download them from [here](https://nodejs.org/en/download/).
- You have a Windows/Mac/Linux machine.

## Installation and Setup

To install the my-react-flow-app, follow these steps:

1. Clone the repository to your local machine:
    ```
    git clone https://github.com/iamxy/my-react-flow-app.git
    ```

2. Navigate to the cloned repository:
    ```
    cd my-react-flow-app
    ```

3. Install the required npm packages:
    ```
    npm install
    ```

## Running the Application

To start the server and run the application, use the following command:
```
npm run serve
```
This command starts the server and the application can be accessed at `localhost:3000` or another specified port in your web browser.

## Configuration

You can set the `WORKSPACE_PATH` environment variable to change the path of the workspace directory. This is where the application fetches the JSON files for the instructions.

For Unix-based systems (Linux/Mac), use:
```
export WORKSPACE_PATH=/path/to/your/workspace
```

For Windows, use:
```
set WORKSPACE_PATH=/path/to/your/workspace
```

Make sure to replace `/path/to/your/workspace` with the actual path to your workspace directory.

## Contact

If you want to contact me you can reach me at `kenneth.liu.xy@gmail.com`.
