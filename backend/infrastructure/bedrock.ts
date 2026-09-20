import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

/**
 * Grants Lambda functions least-privilege access to Amazon Bedrock.
 *
 * Only the insights function needs model invocation rights. The model id is
 * configurable so teams can swap in whichever foundation model is enabled in
 * their region.
 */
export interface BedrockAccessProps {
    insightsFunction: NodejsFunction;
    modelId: string;
}

export class BedrockAccess extends Construct {
    constructor(scope: Construct, id: string, props: BedrockAccessProps) {
        super(scope, id);

        props.insightsFunction.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'],
                resources: [
                    `arn:aws:bedrock:*::foundation-model/${props.modelId}`,
                    `arn:aws:bedrock:*:*:inference-profile/*`,
                ],
            })
        );
    }
}