# State Model

## State catalogue
| ID | State | Meaning | Terminal |
|---|---|---|---|

## State: ST-001
Purpose:  
Entry conditions:  
Actor context:  
Information:  
Actions:  
System behaviour:  
Rules:  
Persisted data:  
Side effects:  
Exit transitions:  
Failures:  
Accessibility:  
Analytics:  

## Transitions
| From | Trigger | Actor | Preconditions | Rules | To | Side effects | Failure |
|---|---|---|---|---|---|---|---|

## Mermaid
```mermaid
stateDiagram-v2
    [*] --> NotStarted
    NotStarted --> InProgress: start
    InProgress --> Draft: save
    Draft --> InProgress: resume
    InProgress --> Validating: submit
    Validating --> InProgress: invalid
    Validating --> Processing: valid
    Processing --> Completed: success
    Processing --> RecoveryRequired: recoverable failure
    RecoveryRequired --> Processing: retry
    RecoveryRequired --> Failed: exhausted
    InProgress --> Cancelled: cancel
    Completed --> [*]
    Failed --> [*]
    Cancelled --> [*]
```
