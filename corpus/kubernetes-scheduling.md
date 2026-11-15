# Kubernetes Pod Scheduling

In Kubernetes, the scheduler is the control-plane component that decides which node each newly created pod runs on. A pod that has not been assigned yet sits in the Pending state. The scheduler watches for such pods and places them one at a time through a two-part cycle: filtering, then scoring.

Filtering removes every node that cannot run the pod. A node is filtered out if it lacks the CPU or memory the pod requests, if it is marked unschedulable, if its taints are not tolerated by the pod, or if the pod's node affinity rules exclude it. The pods' resource requests, not their actual usage, are what count here, which is why honest requests matter: a pod that requests far more than it uses wastes cluster capacity, and a pod that requests too little may land on a node that later runs out of memory.

Scoring then ranks the surviving nodes. Scoring plugins reward nodes that spread pods evenly across zones, nodes that already hold the pod's container images in their local cache, and nodes with a good balance of free resources. The scheduler picks the highest-scoring node and binds the pod to it by writing the assignment to the API server. If no node passes filtering, the pod stays Pending and the scheduler retries later, emitting an event that explains which filters rejected the nodes.

The scheduler can be bypassed. Setting the nodeName field on a pod tells the kubelet on that node to run it directly, with no feasibility checks at all. Static pods work this way. DaemonSets take a different route to the same goal, creating one pod per node through the normal scheduler with affinity rules that target every node.

When cluster demand exceeds supply, lower-priority pods may be preempted. A high-priority pod that cannot be placed can evict running pods with lower priority values, freeing room. The evicted pods are expected to be rescheduled elsewhere, so preemption is meant for workloads that tolerate interruption.
