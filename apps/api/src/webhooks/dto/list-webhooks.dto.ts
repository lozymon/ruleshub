import { PaginationDto } from "../../common/dto/pagination.dto";

// Webhook list + deliveries share the same shape today; one DTO covers
// both endpoints. Extend if either grows query parameters.
export class ListWebhooksDto extends PaginationDto {}
